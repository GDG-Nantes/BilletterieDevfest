import { AxiosInstance } from "axios";
import { Commande } from "../../../web-server/interfaces/types";

export class ServicesPartenaires {
  client: AxiosInstance;
  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async consulterCommande(idCommande: string): Promise<Commande> {
    const sponsors = await this.client.get<Commande>(`/commandes/${idCommande}`);
    return sponsors.data;
  }
}
