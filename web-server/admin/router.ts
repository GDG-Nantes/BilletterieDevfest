import express from "express";
import { authMiddleware } from "../auth";
import { BilletWebApi } from "../billetweb/api";
import { Commande, MarquerCommandePayee } from "../interfaces/types";

const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.get<string, {}, Commande[], {}>(
  "/commandes",
  async (req, res, next) => {
    try {
      const commandes = await BilletWebApi.listerCommandes();
      res.send(commandes);
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.post<string, {}, null, MarquerCommandePayee>(
  "/commandes/paiement",
  async (req, res, next) => {
    try {
      const input = req.body;
      await BilletWebApi.marquerCommePaye(input.idCommande);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default adminRouter;
