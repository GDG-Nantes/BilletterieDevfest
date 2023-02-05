import { Navigate, Route, Routes } from "react-router-dom";
import { Authenticated } from "../auth";
import { RecapSponsor } from "../components/partenaires/recap-sponsor";
import { Sponsors } from "./gestion-partenaires/sponsors";

export const RouterAdmin = () => (
  <Routes>
    <Route path="/admin/*" element={<Authenticated />}>
      <Route index element={<Navigate to={"/admin/sponsors"} />} />
      <Route path="sponsors">
        <Route index element={<Sponsors />} />
        <Route path=":idCommande" element={<RecapSponsor />} />
      </Route>
    </Route>
  </Routes>
);
