import { useQuery } from "react-query";
import "./index.css";
import { useService } from "./services";

export const Sponsors = () => {
  const service = useService();
  const { data, isLoading, error } = useQuery("sponsors", () =>
    service.getSponsors()
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  return <div>{JSON.stringify(data)}</div>;
};
