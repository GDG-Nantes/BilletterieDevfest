import express from "express";
import { BilletWebApi } from "../billetweb/api";

export const routerPartenaires = express.Router();
routerPartenaires.get("/commandes/:idCommande", async (req, res) => {
  const { idCommande } = req.params;
  const commandes = await BilletWebApi.listerCommandes();
  const commandeConsultee = commandes.find(
    (commande) => commande.extId === idCommande
  );
  if (commandeConsultee == null) {
    res.status(404).send("Commande introuvable");
  } else {
    res.send(commandeConsultee);
  }
});
