import express from "express";
import fs from "node:fs";
import path from "node:path";
import papa from "papaparse";
import { BilletWebApi } from "../billetweb/api";
import { Stand } from "../interfaces/types";

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

const RESERVED_STANDS = ["S9", "G22", "P10", "P8", "P9"];

routerPartenaires.get("/stands", async (req, res) => {
  const csvFileAsString = fs.readFileSync(
    path.join(__dirname, "./stands.csv"),
    { encoding: "utf8" }
  );
  const parsed = papa.parse<Stand>(csvFileAsString, {
    skipEmptyLines: true,
    header: true,
    delimiter: ",",
  });
  if (parsed.errors.length > 0) {
    res.statusCode = 500;
    res.json(parsed.errors);
    return;
  }
  res.json(
    parsed.data.map((stand) => ({
      ...stand,
      reserved: RESERVED_STANDS.includes(stand.id),
    }))
  );
});
routerPartenaires.post("/stands/:idCommande/:idStand", async (req, res) => {
  const { idCommande, idStand } = req.params;
  console.log("SHOULD SAVE", { idCommande, idStand });
  res.statusCode = 201;
  res.end("Saved");
});

export default routerPartenaires;
