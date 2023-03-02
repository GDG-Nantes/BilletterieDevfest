import { Datastore } from "@google-cloud/datastore";
import { CONFIG } from "../config";
import { Commande, ReservedStand } from "../interfaces/types";
import { formatISO } from "date-fns";
import { entity } from "@google-cloud/datastore/build/src/entity";
import KEY_SYMBOL = entity.KEY_SYMBOL;

const datastore = new Datastore({
  projectId: CONFIG.google.projectId,
});

export async function getReservedStands(): Promise<Array<{ idCommande: string } & ReservedStand>> {
  const [entities] = await datastore.runQuery(datastore.createQuery("sponsors"));
  return entities.map((entity) => ({
    idStand: entity.idStand,
    typeMoquette: entity.typeMoquette,
    email: entity.email,
    idCommande: entity[KEY_SYMBOL].name,
  }));
}

export async function getReservedStand(idCommande: string): Promise<ReservedStand | null> {
  const [entities] = await datastore.runQuery(
    datastore.createQuery("sponsors").filter("__key__", "=", datastore.key(["sponsors", idCommande]))
  );
  if (entities.length == 0) {
    return null;
  }
  const entity = entities[0] as ReservedStand;
  return { idStand: entity.idStand, typeMoquette: entity.typeMoquette, email: entity.email };
}

export async function saveReservedStands(idCommande: string, dataIn: ReservedStand, commande: Commande) {
  const reservedOn = formatISO(new Date());
  const key = datastore.key(["sponsors", idCommande]);
  const data = { ...dataIn, reservedOn, entreprise: commande.acheteur.entreprise };
  const standAttribution = {
    key,
    data,
  };
  await datastore.save(standAttribution);
  console.log("SAVED", { idCommande, ...data });
}
