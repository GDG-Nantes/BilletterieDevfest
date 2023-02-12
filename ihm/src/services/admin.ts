import { AxiosInstance } from "axios";
import { Commande, MarquerCommandePayee } from "../../../web-server/interfaces/types";

export class ServicesAdmin {
  client: AxiosInstance;
  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async getSponsors(): Promise<Commande[]> {
    const sponsors = await this.client.get<Commande[]>("/commandes");
    return sponsors.data;
  }

  async marquerCommandePayee(idCommande: string): Promise<null> {
    return this.client.post<null, null, MarquerCommandePayee>("/commandes/paiement", {
      idCommande,
    });
  }
}
