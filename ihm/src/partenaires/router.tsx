import { Route, Routes } from "react-router-dom";
import { RecapSponsor } from "../components/partenaires/recap-sponsor";
import { StandChoice } from "../components/stands/stand-choice";
import { StandChoiceSaved } from "../components/stands/stand-choice-saved";
import { Accueil } from "./accueil";

export const RouterPartenaires = () => (
  <Routes>
    <Route path="/commande/:idCommande" element={<RecapSponsor />} />
    <Route path="/stands/:idCommande/:idStand" element={<StandChoiceSaved />} />
    <Route path="/stands/:idCommande" element={<StandChoice />} />
    <Route path="/" element={<Accueil />} />
  </Routes>
);
