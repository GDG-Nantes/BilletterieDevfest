import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useServices } from "../../services";
import { MyButton } from "../links";
import { Commande, OptionsPack } from "../../../../web-server/interfaces/types";
import "./style.scss";
import classNames from "classnames";
import { Navbar } from "../../layout/layout";

export const RecapSponsor: React.FC<{ displayJson?: boolean }> = ({ displayJson }) => {
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
      <Navbar title={commande.acheteur.entreprise}>
        <MyButton href={commande.lienGestionCommande} color="secondary">
          Gérer la commande Billetweb
        </MyButton>
      </Navbar>
      <Container className="recap-sponsor">
        <Grid container spacing={2}>
          <Grid item md={4} xs={12}>
            <CardSponsoring commande={commande} />
          </Grid>
          <Grid item md={4} xs={12}>
            <CardStand commande={commande} />
          </Grid>
        </Grid>
        {displayJson && (
          <Box>
            <pre>{JSON.stringify(commande, null, 2)}</pre>
          </Box>
        )}
      </Container>
    </>
  );
};

const CardSponsoring: React.FC<{ commande: Commande }> = ({ commande }) => {
  const estCommandePayee = commande.paiement.status === "PAYE";
  return (
    <Card className={classNames(estCommandePayee ? "ok" : "warning")}>
      <CardHeader title="Sponsoring" />
      <CardContent>
        <List>
          <ListItem>
            <strong>Pack</strong>: {commande.typePack}
          </ListItem>
          {commande.options.map((option) => (
            <ListItem key={option}>
              <strong>Option</strong>: {LABELS_OPTIONS[option]}
            </ListItem>
          ))}
          <ListItem>
            <strong>Email de Contact</strong>: {commande.acheteur.email}
          </ListItem>
          <ListItem>
            <strong>Prix TTC</strong>: {commande.paiement.montantTotalTTC} €
          </ListItem>
          <ListItem>
            <strong>Status</strong>: {estCommandePayee ? "Paiement reçu ✔" : "Paiement non reçu ❌"}
          </ListItem>
        </List>
      </CardContent>
      <CardActions>
        <MyButton href={commande.lienGestionCommande} color="secondary" variant="outlined">
          Accéder à ma commande
        </MyButton>
      </CardActions>
    </Card>
  );
};

const LABELS_OPTIONS: Record<OptionsPack, string> = {
  AFTER: "After Party",
  ELECTRICITE_6kW: "2 Boitiers électriques 3kW",
  ELECTRICITE_21kW: "Boitiers électriques 21kW",
  INTERNET_16Mbps: "Connexion interner 16Mbps",
  PLATINIUM_XL: "Stand PXL",
  ANNUEL: "Sponsor Annuel",
};

const CardStand: React.FC<{ commande: Commande }> = ({ commande }) => {
  const estCommandePayee = commande.paiement.status === "PAYE";
  const estStandChoisi = commande.stand != null;
  return (
    <Card className={classNames(estStandChoisi ? "ok" : "warning")}>
      <CardHeader title="Stand" />
      <CardContent>
        {estStandChoisi ? (
          <List>
            <ListItem>
              <strong>Stand</strong>: {commande.stand?.idStand}
            </ListItem>
            <ListItem>
              <strong>Moquette</strong>: {commande.stand?.typeMoquette}
            </ListItem>
          </List>
        ) : (
          <>
            <Typography variant={"h5"} color="secondary">
              {estCommandePayee
                ? "Vous n'avez pas choisi votre stand"
                : "Vous devez payer votre commande afin d'accéder au choix de stand"}
            </Typography>
          </>
        )}
      </CardContent>
      <CardActions>
        <MyButton disabled={!estCommandePayee} color="secondary" variant="outlined" href={`/stands/${commande.extId}`}>
          Choisir mon stand
        </MyButton>
      </CardActions>
    </Card>
  );
};
