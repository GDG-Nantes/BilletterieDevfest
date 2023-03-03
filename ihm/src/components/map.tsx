import React from "react";
import { useServices } from "../services";
import { useQuery } from "react-query";
import { StandMaps } from "../components/stands/maps";

export const PageStandMapsPublic: React.FC = () => {
  const { stands: serviceStands } = useServices();
  const { data: stands, isLoading, error } = useQuery(`stands-list`, () => serviceStands.standList());
  return (
    <>
      <StandMaps disabled={true} />
    </>
  );
};
