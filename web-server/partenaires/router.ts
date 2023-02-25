import express from "express";
import fs from "node:fs";
import path from "node:path";
import papa from "papaparse";
import { Datastore } from "@google-cloud/datastore";
import { BilletWebApi } from "../billetweb/api";
import { Stand } from "../interfaces/types";
import { CONFIG } from "../config";

const routerPartenaires = express.Router();

const datastore = new Datastore({
  projectId: CONFIG.google.projectId,
});

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

  const reserved = await getReservedStands();
  res.json(
    parsed.data.map((stand) => ({
      ...stand,
      reserved,
    }))
  );
});

routerPartenaires.post("/stands/:idCommande/:idStand", async (req, res) => {
  const { idCommande, idStand } = req.params;
  const key = datastore.key(["sponsors", idCommande]);
  const reserved = await getReservedStands();

  if (reserved.includes(idStand)) {
    res.statusCode = 400;
    res.end("This stand was reserved while you made your choice.");
  }

  const standAttribution = {
    key,
    data: { stand: idStand },
  };
  const result = await datastore.save(standAttribution);
  console.log("SAVED", { idCommande, idStand, key, result });
  res.statusCode = 201;
  res.end("Saved");
});

function getReservedStands(): Promise<string[]> {
  return (
    datastore
      .runQuery(datastore.createQuery("sponsors").filter("stand", "!=", ""))
      // FIXME when network will work again
      .then((results) => results.map((row: any) => row["stand"]))
  );
}

export default routerPartenaires;
