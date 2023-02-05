import { AxiosInstance } from "axios";
import { Commande } from "../../../web-server/interfaces/types";

export class ServicesAdmin {
  client: AxiosInstance;
  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async getSponsors(): Promise<Commande[]> {
    const sponsors = await this.client.get<Commande[]>("/commandes");
    return sponsors.data;
  }
}
