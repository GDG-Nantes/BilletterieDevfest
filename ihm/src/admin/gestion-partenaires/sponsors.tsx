import {
  Box,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Input,
  List,
  ListItem,
} from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import { useQuery } from "react-query";
import { Commande } from "../../../../interfaces/types";
import { MyButton } from "../../components/links";
import { normalize } from "../../helpers";
import { useServices } from "../../services";

export const Sponsors = () => {
  const services = useServices();
  const [filtre, setFiltre] = React.useState<string>("");
  const { data: commandes, isLoading, error } = useQuery("sponsors", () => services.admin.getSponsors());

  const commandesFiltrees = React.useMemo<Commande[]>(() => {
    if (commandes == null) {
      return [];
    }
    return commandes
      ?.filter(
        (commande) =>
          filtre == "" ||
          normalize(commande.acheteur.entreprise).includes(normalize(filtre)) ||
          commande.extId.includes(filtre) ||
          commande.options.some((option) => normalize(option).includes(normalize(filtre)))
      )
      .sort((c1, c2) => c1.acheteur.entreprise.localeCompare(c2.acheteur.entreprise));
  }, [commandes, filtre]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <Box>error</Box>;
  }

  return (
    <Stack direction="column" spacing={2}>
      <Input value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="Recherche" />
      <Grid spacing={2} container>
        {commandesFiltrees?.map((commande) => (
          <Grid item>
            <CardSponsor key={commande.extId} commande={commande} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

const CardSponsor: React.FC<{ commande: Commande }> = ({ commande }) => {
  const estPaye = commande.paiement.status === "PAYE";
  return (
    <Card sx={{ border: `5px solid ${estPaye ? "green" : "red"}` }}>
      <CardHeader title={commande.acheteur.entreprise} />
      <CardContent>
        <List>
          <ListItem>{estPaye ? "Payé ✅" : "Non payé"}</ListItem>
          <ListItem>Montant TTC: {commande.paiement.montantTotalTTC}€</ListItem>
          <ListItem>Email: {commande.acheteur.email}</ListItem>
          <ListItem>Options: {commande.options.join(", ")}</ListItem>
          {commande.notes && <ListItem>Notes: {commande.notes}</ListItem>}
        </List>
      </CardContent>
      <CardActions>
        {!estPaye && <MyButton>Déclarer payé</MyButton>}
        <ButtonGroup variant="contained">
          <MyButton href={commande.lienGestionCommande}>Lien Billetweb</MyButton>
          <MyButton href={`/admin/sponsors/${commande.extId}`}>Détails</MyButton>
        </ButtonGroup>
      </CardActions>
    </Card>
  );
};
