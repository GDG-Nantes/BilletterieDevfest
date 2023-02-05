import express from "express";
import { BilletWebApi } from "../billetweb/api";

export const adminRouter = express.Router();
adminRouter.get("/commandes", async (req, res) => {
  const commandes = await BilletWebApi.listerCommandes();
  res.send(commandes);
});
