import express from "express";
import { BilletWebApi } from "../billetweb/api";
import STANDS from "../stands/stands.json";
import { ERROR_CODES } from "../interfaces/errors";
import { getReservedStand, getReservedStands, saveReservedStands } from "../stands";

const routerPartenaires = express.Router();

routerPartenaires.get("/commandes/:idCommande", async (req, res) => {
  const { idCommande } = req.params;
  const commandeConsultee = await BilletWebApi.consulterCommande(idCommande);
  if (commandeConsultee == null) {
    res.status(404).send("Commande introuvable");
  } else {
    const stand = await getReservedStand(idCommande);
    if (stand != null) {
      commandeConsultee.stand = stand;
    }
    res.send(commandeConsultee);
  }
});

routerPartenaires.get("/stands", async (req, res) => {
  const reservedStands = await getReservedStands();
  res.json(
    STANDS.map((id) => ({
      id,
      reserved: reservedStands.some((reservedStand) => reservedStand.stand === id),
    }))
  );
});

routerPartenaires.post("/stands/:idCommande/:idStand", async (req, res) => {
  const { idCommande, idStand } = req.params;
  const reserved = await getReservedStands();
  const commande = await BilletWebApi.consulterCommande(idCommande);

  if (commande.paiement.status != "PAYE") {
    res.statusCode = 400;
    res.statusMessage = ERROR_CODES.NOT_PAID;
    res.end("You haven't paid your bill yet");
  } else if (reserved.some((reservedStand) => reservedStand.stand === idStand)) {
    res.statusCode = 400;
    res.statusMessage = ERROR_CODES.ALREADY_RESERVED_STAND;
    res.end("This stand was reserved while you made your choice.");
  } else {
    await saveReservedStands(idCommande, idStand, commande);

    res.statusCode = 201;
    res.end("Saved");
  }
});

export default routerPartenaires;
