import { Route, Routes } from "react-router-dom";
import { RecapSponsor } from "../components/partenaires/recap-sponsor";
import { Accueil } from "./accueil";

export const RouterPartenaires = () => (
  <Routes>
    <Route path="/commande/:idCommande" element={<RecapSponsor />} />
    <Route path="/" element={<Accueil />} />
  </Routes>
);
