import { Route, Routes } from "react-router-dom";
import { RecapSponsor } from "../components/partenaires/recap-sponsor";
import { StandChoice } from "../components/stands/stand-choice";
import { Accueil } from "./accueil";
import { PageStandMapsPublic } from "../components/map";

export const RouterPartenaires = () => (
  <Routes>
    <Route path="/commande/:idCommande" element={<RecapSponsor />} />
    <Route path="/stands/:idCommande" element={<StandChoice />} />
    <Route path="/map" element={<PageStandMapsPublic />} />
    <Route path="/" element={<Accueil />} />
  </Routes>
);
