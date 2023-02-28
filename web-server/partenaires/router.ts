import express from "express";
import { BilletWebApi } from "../billetweb/api";
import STANDS from "../stands/stands.json";
import { ERROR_CODES } from "../interfaces/errors";
import { getReservedStand, getReservedStands, saveReservedStands } from "../stands";
import { TYPES_MOQUETTE } from "../interfaces/constantes";

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
    STANDS.map((id) => {
      const matchingStand = reservedStands.find((reservedStand) => reservedStand.idStand === id);
      return {
        id,
        reserved: matchingStand != null,
        typeMoquette: matchingStand?.typeMoquette,
      };
    })
  );
});

routerPartenaires.post("/stands/:idCommande", async (req, res) => {
  const { idCommande } = req.params;
  const { idStand, typeMoquette } = req.body;
  const reserved = await getReservedStands();
  const commande = await BilletWebApi.consulterCommande(idCommande);

  if (commande.paiement.status != "PAYE") {
    res.statusCode = 400;
    res.statusMessage = ERROR_CODES.NOT_PAID;
    res.end("Vous n'avez pas encore payé la facture");
  } else if (reserved.some((reservedStand) => reservedStand.idStand === idStand)) {
    res.statusCode = 400;
    res.statusMessage = ERROR_CODES.ALREADY_RESERVED_STAND;
    res.end("Ce stand a déja été réservé.");
  } else if (!TYPES_MOQUETTE.includes(typeMoquette)) {
    res.statusCode = 400;
    res.statusMessage = ERROR_CODES.MOQUETTE_INEXISTANTE;
    res.end("Ce choix de couleur de moquette n'existe pas.");
  } else {
    await saveReservedStands(idCommande, idStand, typeMoquette, commande);

    res.statusCode = 201;
    res.end("Saved");
  }
});

export default routerPartenaires;
