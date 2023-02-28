import { AppBar, Box, Input, Toolbar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { useQuery } from "react-query";
import { Commande, TypePack } from "../../../../web-server/interfaces/types";
import { MyButton } from "../../components/links";
import { normalize } from "../../helpers";
import { useServices } from "../../services";

const LISTE_TYPES_PACK_STANDS: TypePack[] = ["PLATINIUM", "GOLD", "SILVER"];

export const Sponsors = () => {
  const services = useServices();
  const [filtre, setFiltre] = React.useState<string>("");
  const { data: commandes, isLoading, error, refetch } = useQuery("sponsors", () => services.admin.getSponsors());

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

  if (error) {
    return <Box>error</Box>;
  }

  return (
    <>
      <AppBar sx={{ marginBottom: "20px" }} position="static">
        <Toolbar>
          <Input fullWidth value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="Recherche" />
        </Toolbar>
      </AppBar>

      <DataGrid
        loading={isLoading}
        rows={commandesFiltrees}
        columns={[
          {
            field: "entreprise",
            headerName: "Entreprise",
            valueGetter: ({ row }) => row.acheteur.entreprise,
            width: 300,
          },
          {
            field: "typePack",
            headerName: "Pack",
          },
          {
            field: "paiement",
            headerName: "Payé",
            valueGetter: ({ row }) => row.paiement.status === "PAYE",
            type: "boolean",
            editable: true,
            valueSetter: (params) => {
              if (params.value) {
                services.admin.marquerCommandePayee(params.row.id).then(() => refetch());
              } else {
                window.alert("Impossible de revenir en arrière sur le paiement");
              }
              return params.row;
            },
          },
          {
            field: "paiement.montantTotalTTC",
            headerName: "Montant (TTC)",
            type: "number",
            valueGetter: ({ row }) => row.paiement.montantTotalTTC,
            valueFormatter: ({ value }) => value + " €",
            width: 150,
          },
          {
            field: "stand",
            headerName: "Stand",
            align: "center",
            headerAlign: "center",
          },
          {
            field: "options",
            headerName: "Options",
            valueGetter: ({ row }) => row.options.join(", "),
            width: 300,
          },
          {
            field: "actions",
            headerName: "Actions",
            type: "actions",
            getActions: (params) => [
              <MyButton href={params.row.lienGestionCommande} color="secondary">
                Billetweb
              </MyButton>,
              <MyButton href={`/admin/sponsors/${params.row.extId}`} color="secondary" variant="contained">
                Recap
              </MyButton>,
              <>
                {LISTE_TYPES_PACK_STANDS.includes(params.row.typePack) && (
                  <MyButton href={`/stands/${params.row.extId}`} color="secondary" variant="outlined">
                    Choix Stand
                  </MyButton>
                )}
              </>,
            ],
            align: "left",
            width: 400,
          },
        ]}
        hideFooterPagination
        hideFooter
      />
    </>
  );
};
