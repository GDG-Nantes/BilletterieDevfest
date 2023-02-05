import { Box, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useServices } from "../../services";
import { MyButton } from "../links";

export const RecapSponsor = () => {
  const { partenaires: servicesPartenaires } = useServices();
  const { idCommande } = useParams();

  if (idCommande == null) {
    return <Box>Le lien est invalide</Box>;
  }

  const {
    data: commande,
    isLoading,
    error,
  } = useQuery(`sponsor-${idCommande}`, () => servicesPartenaires.consulterCommande(idCommande));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || commande == null) {
    return <Box>Commande introuvable</Box>;
  }

  return (
    <>
      <Typography variant="h1">{commande.acheteur.entreprise}</Typography>
      <MyButton href={commande.lienGestionCommande}>Gérer la commande Billetweb</MyButton>
      <Box>
        <pre>{JSON.stringify(commande, null, 2)}</pre>
      </Box>
    </>
  );
};
