import express from "express";
import { BilletWebApi } from "../billetweb/api";

const routerPartenaires = express.Router();
routerPartenaires.get("/commandes/:idCommande", async (req, res) => {
  const { idCommande } = req.params;
  const commandeConsultee = await BilletWebApi.consulterCommande(idCommande);
  if (commandeConsultee == null) {
    res.status(404).send("Commande introuvable");
  } else {
    res.send(commandeConsultee);
  }
});

export default routerPartenaires;
