import express from "express";
import { authMiddleware } from "../auth";
import { BilletWebApi } from "../billetweb/api";
import { PayerCommande } from "../interfaces/types";

const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.get("/commandes", async (req, res, next) => {
  try {
    const commandes = await BilletWebApi.listerCommandes();
    res.send(commandes);
  } catch (err) {
    next(err);
  }
});

adminRouter.post<PayerCommande>(
  "/commandes/paiement",
  async (req, res, next) => {
    try {
      const input = req.body as PayerCommande;
      await BilletWebApi.marquerCommePaye(input.idCommande, input.estPaye);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default adminRouter;
