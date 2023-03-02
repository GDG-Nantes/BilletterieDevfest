import { AxiosInstance } from "axios";
import { ReservedStand, Stand } from "../../../web-server/interfaces/types";

export class ServiceStands {
  client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  standList(): Promise<Stand[]> {
    return this.client.get<Stand[]>(`/stands`).then((res) => res.data);
  }

  saveChoice(idCommande: string, data: ReservedStand): Promise<unknown> {
    return this.client.post(`/stands/${idCommande}`, data);
  }
}
