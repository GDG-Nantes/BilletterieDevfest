import axios, { AxiosInstance } from "axios";

class Services {
  client: AxiosInstance;
  baseURL = "http://localhost:8080";

  constructor() {
    this.client = axios.create({ baseURL: this.baseURL });
  }

  async getSponsors() {
    return this.client.get("/sponsors").then((x) => x.data);
  }
}
