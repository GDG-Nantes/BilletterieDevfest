import { Info, Notes } from "@mui/icons-material";
import { Box, Input } from "@mui/material";
import { Stack } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";
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

  if (error) {
    return <Box>error</Box>;
  }

  return (
    <Stack direction="column" spacing={2} height="100%" width="100%">
      <Input value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="Recherche" />

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
              window.alert("J'ai pas encore implémenté ça");
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
            field: "actions",
            headerName: "Actions",
            type: "actions",
            getActions: (params) => [
              <MyButton href={params.row.lienGestionCommande}>
                <Info />
              </MyButton>,
              <MyButton href={`/admin/sponsors/${params.row.extId}`}>
                <Notes />
              </MyButton>,
            ],
            align: "right",
            width: 200,
          },
          {
            field: "options",
            headerName: "Options",
            valueGetter: ({ row }) => row.options.join(", "),
            width: 300,
          },
          {
            field: "notes",
            headerName: "Notes",
            width: 300,
          },
        ]}
        hideFooterPagination
      />
    </Stack>
  );
};
