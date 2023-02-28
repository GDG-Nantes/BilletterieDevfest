import {} from "@react-oauth/google";
import axios from "axios";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useUser } from "../auth";
import { CONFIG } from "../config";
import { ServicesAdmin } from "./admin";
import { ServicesPartenaires } from "./partenaires";
import { ServiceStands } from "./stands";

class Services {
  public admin: ServicesAdmin;
  public partenaires: ServicesPartenaires;
  public stands: ServiceStands;

  constructor(token?: string) {
    this.admin = new ServicesAdmin(
      axios.create({
        baseURL: CONFIG.adminApiBaseUrl,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })
    );
    this.partenaires = new ServicesPartenaires(
      axios.create({
        baseURL: CONFIG.apiBaseUrl,
      })
    );
    this.stands = new ServiceStands(
      axios.create({
        baseURL: CONFIG.apiBaseUrl,
      })
    );
  }
}

const ServiceContext = React.createContext<Services>({} as any);
const queryClient = new QueryClient();

export const ServiceProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const user = useUser();

  const service = React.useMemo<Services>(() => {
    return new Services(user?.credential);
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <ServiceContext.Provider value={service}>{children}</ServiceContext.Provider>
    </QueryClientProvider>
  );
};

export const useServices = () => {
  return React.useContext(ServiceContext);
};
