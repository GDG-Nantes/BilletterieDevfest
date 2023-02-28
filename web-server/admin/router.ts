import express from "express";
import { authMiddleware } from "../auth";
import { BilletWebApi } from "../billetweb/api";
import { Commande, MarquerCommandePayee } from "../interfaces/types";
import { getReservedStands } from "../stands";

const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.get<string, unknown, Commande[], unknown>("/commandes", async (req, res, next) => {
  try {
    const commandes = await BilletWebApi.listerCommandes();
    const reservedStands = await getReservedStands();
    reservedStands.forEach((reservedStand) => {
      const commande = commandes.find((commande) => commande.extId === reservedStand.idCommande);
      if (commande != null) {
        commande.stand = reservedStand.stand;
      }
    });
    res.send(commandes);
  } catch (err) {
    next(err);
  }
});

adminRouter.post<string, unknown, null, MarquerCommandePayee>("/commandes/paiement", async (req, res, next) => {
  try {
    const input = req.body;
    await BilletWebApi.marquerCommePaye(input.idCommande);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default adminRouter;
