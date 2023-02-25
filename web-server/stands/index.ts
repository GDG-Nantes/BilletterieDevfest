import { Datastore } from "@google-cloud/datastore";
import { CONFIG } from "../config";
import { Commande } from "../interfaces/types";
import { formatISO } from "date-fns";
import { entity } from "@google-cloud/datastore/build/src/entity";
import KEY_SYMBOL = entity.KEY_SYMBOL;

const datastore = new Datastore({
  projectId: CONFIG.google.projectId,
});

export async function getReservedStands(): Promise<{ idCommande: string; stand: string }[]> {
  const [entities] = await datastore.runQuery(datastore.createQuery("sponsors"));
  return entities.map((entity) => ({
    stand: entity.stand,
    idCommande: entity[KEY_SYMBOL].name,
  }));
}

export async function getReservedStand(idCommande: string): Promise<string | null> {
  const [entities] = await datastore.runQuery(
    datastore.createQuery("sponsors").filter("__key__", "=", datastore.key(["sponsors", idCommande]))
  );
  if (entities.length == 0) {
    return null;
  }
  return entities[0].stand;
}

export async function saveReservedStands(idCommande: string, idStand: string, commande: Commande) {
  const reservedOn = formatISO(new Date());
  const key = datastore.key(["sponsors", idCommande]);
  const data = { stand: idStand, reservedOn, entreprise: commande.acheteur.entreprise };
  const standAttribution = {
    key,
    data,
  };
  await datastore.save(standAttribution);
  console.log("SAVED", { idCommande, ...data });
}
