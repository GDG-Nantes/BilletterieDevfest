import {} from "@react-oauth/google";
import axios, { AxiosInstance } from "axios";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useUser } from "./auth";
import { CONFIG } from "./config";

class Services {
  client: AxiosInstance;
  baseURL = CONFIG.apiBaseUrl;

  constructor(token?: string) {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  }

  async getSponsors() {
    return this.client.get("/sponsors").then((x) => x.data);
  }
}

const ServiceContext = React.createContext<Services>({} as any);
const queryClient = new QueryClient();

export const ServiceProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const user = useUser();

  const service = React.useMemo<Services>(() => {
    return new Services(user?.credential);
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <ServiceContext.Provider value={service}>
        {children}
      </ServiceContext.Provider>
    </QueryClientProvider>
  );
};

export const useService = () => {
  return React.useContext(ServiceContext);
};
