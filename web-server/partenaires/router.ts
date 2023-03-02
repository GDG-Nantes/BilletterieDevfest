import express from "express";
import { BilletWebApi } from "../billetweb/api";
import STANDS from "../stands/stands.json";
import { ERROR_CODES } from "../interfaces/errors";
import { getReservedStand, getReservedStands, saveReservedStands } from "../stands";
import { TYPES_MOQUETTE } from "../interfaces/constantes";
import { Commande, ReservedStand, TypePack } from "../interfaces/types";

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
  const dataIn = req.body as ReservedStand;
  const reservedStands = await getReservedStands();
  const commande = await BilletWebApi.consulterCommande(idCommande);

  const reservedStand = reservedStands
    .filter((reservedStand) => reservedStand.idCommande !== idCommande)
    .find((reservedStand) => reservedStand.idStand === dataIn.idStand);

  if (commande.paiement.status != "PAYE") {
    res.statusCode = 400;
    res.statusMessage = ERROR_CODES.NOT_PAID;
    res.end("Le paiement n'a pas encore été reçu pas le GDG");
  } else if (reservedStand != null) {
    res.statusCode = 400;
    res.statusMessage = ERROR_CODES.ALREADY_RESERVED_STAND;
    res.end("Ce stand a déja été réservé.");
  } else if (isStandValideCommande(commande, dataIn)) {
    res.statusCode = 400;
    res.statusMessage = ERROR_CODES.FORBIDDEN_STAND;
    res.end("Vous n'avez pas le droit de réserver ce stand.");
  } else if (!TYPES_MOQUETTE.includes(dataIn.typeMoquette)) {
    res.statusCode = 400;
    res.statusMessage = ERROR_CODES.MOQUETTE_INEXISTANTE;
    res.end("Ce choix de couleur de moquette n'existe pas.");
  } else {
    await saveReservedStands(idCommande, dataIn, commande);

    res.statusCode = 201;
    res.end("Saved");
  }
});

function isStandValideCommande(commande: Commande, dataIn: ReservedStand) {
  const prefixByTypes: { [k in TypePack]?: string } = {
    PLATINIUM: "P",
    SILVER: "S",
    GOLD: "G",
    JOBBOARD: "X",
  };
  return prefixByTypes[commande.typePack] != null && dataIn.idStand.startsWith(prefixByTypes[commande.typePack] || "");
}

export default routerPartenaires;
