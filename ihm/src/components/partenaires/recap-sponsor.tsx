import { AppBar, Box, Container, Toolbar } from "@mui/material";
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
      <AppBar position="static" sx={{ marginBottom: "20px" }}>
        <Toolbar>
          <h1 style={{ flexGrow: 1 }}>{commande.acheteur.entreprise}</h1>
          <MyButton href={commande.lienGestionCommande} color="secondary">
            Gérer la commande Billetweb
          </MyButton>
        </Toolbar>
      </AppBar>
      <Container>
        <MyButton color="secondary" variant="outlined" href={`/stands/${idCommande}`}>
          Lien vers le choix des stands
        </MyButton>
        <Box>
          <pre>{JSON.stringify(commande, null, 2)}</pre>
        </Box>
      </Container>
    </>
  );
};
