import { Input } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { useQuery } from "react-query";
import { Commande, TypePack } from "../../../web-server/interfaces/types";
import { MyButton } from "../components/links";
import { normalize } from "../helpers";
import { useServices } from "../services";
import { Navbar } from "../layout/layout";

const LISTE_TYPES_PACK_STANDS: TypePack[] = ["PLATINIUM", "GOLD", "SILVER", "JOBBOARD"];

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
    console.error(error);
    window.location.reload();
    return <></>;
  }

  return (
    <>
      <Navbar title={"Admin Billetterie"}>
        <Input fullWidth value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="Recherche" />
        <MyButton href={`/admin/map`} variant="outlined" color="secondary" style={{ marginRight: "20px" }}>
          Plan
        </MyButton>
      </Navbar>

      <DataGrid
        loading={isLoading}
        rows={commandesFiltrees}
        getRowHeight={() => "auto"}
        columns={[
          {
            field: "entreprise",
            headerName: "Entreprise",
            flex: 1,
            valueGetter: ({ row }) => row.acheteur.entreprise,
          },
          {
            field: "typePack",
            headerName: "Pack",
            flex: 0.4,
          },
          {
            field: "paiement",
            headerName: "Payé",
            valueGetter: ({ row }) => row.paiement.status === "PAYE",
            type: "boolean",
            editable: true,
            flex: 0.3,
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
            flex: 0.4,
            valueGetter: ({ row }) => row.paiement.montantTotalTTC,
            valueFormatter: ({ value }) => value + " €",
          },
          {
            field: "stand",
            headerName: "Stand",
            align: "center",
            headerAlign: "center",
            flex: 0.5,
            valueGetter: ({ row }) => (row.stand != null ? row.stand.idStand + " - " + row.stand.typeMoquette : null),
          },
          {
            field: "options",
            headerName: "Options",
            flex: 0.7,
            valueGetter: ({ row }) => row.options.join(", "),
          },
          {
            field: "actions",
            headerName: "Actions",
            type: "actions",
            flex: 2,
            getActions: (params) => [
              <MyButton href={params.row.lienGestionCommande} color="secondary" variant="contained">
                Billetweb
              </MyButton>,
              <MyButton href={`/admin/sponsors/${params.row.extId}`} color="secondary">
                Recap
              </MyButton>,
              <MyButton href={`/commande/${params.row.extId}`} color="secondary" variant="contained">
                Lien Public
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
          },
        ]}
        hideFooterPagination
        hideFooter
      />
    </>
  );
};
