import React from "react";
import { useServices } from "../services";
import { useQuery } from "react-query";
import { Navbar } from "../layout/layout";
import { MyButton } from "../components/links";
import { StandMaps } from "../components/stands/maps";

export const PageStandMaps: React.FC = () => {
  const { stands: serviceStands } = useServices();
  const { data: stands, isLoading, error } = useQuery(`stands-list`, () => serviceStands.standList());
  return (
    <>
      <Navbar title={"Admin Billetterie"}>
        <MyButton href={`/admin/sponsors`} variant="outlined" color="secondary" style={{ marginRight: "20px" }}>
          Sponsors
        </MyButton>
      </Navbar>
      <StandMaps disabled={true} />
    </>
  );
};
