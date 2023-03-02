import { Button, Container, Stack, TextField, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { ReservedStand } from "../../../../web-server/interfaces/types";
import { TYPES_MOQUETTE } from "../../../../web-server/interfaces/constantes";
import { useServices } from "../../services";

import { MyButton } from "../links";
import classNames from "classnames";
import { Navbar } from "../../layout/layout";
import { StandMaps } from "./maps";
import "./stand-choice.scss";

export function StandChoice() {
  const { stands, isLoading: isStandsLoading } = useStandList();

  const { stands: serviceStands } = useServices();
  const { idCommande } = useParams();
  const [standChoice, setStandChoice] = useState<string | null>(null);

  if (!idCommande) {
    window.location.href = "https://devfest2023.gdgnantes.com";
    return <></>;
  }
  const { commande, isLoading: isCommandeLoading, error } = useCommande();

  useEffect(() => {
    if (commande?.stand != null) {
      setStandChoice(commande.stand.idStand);
    }
  }, [commande?.stand]);

  const saveChoice = (data: ReservedStand) => {
    serviceStands
      .saveChoice(idCommande, data)
      .then(() => (window.location.href = `/commande/${idCommande}`))
      .catch((err) => {
        console.error(err);
        window.location.reload();
      });
  };

  if (isStandsLoading || isCommandeLoading) {
    return <></>;
  }
  if (error || !commande) {
    return <div>La commande n'existe pas</div>;
  }
  if (commande.stand != null) {
    const standSelectionne = stands?.find((stand) => stand.id === commande.stand?.idStand);
    if (standSelectionne != null) {
      standSelectionne.reserved = false;
    }
  }

  let messageToolbar;
  const estCommandeImpayee = commande.paiement.status !== "PAYE";
  if (estCommandeImpayee) {
    messageToolbar = `Vous ne pourrez choisir votre stand qu'après réception du règlement par le GDG Nantes`;
  } else if (commande.stand != null) {
    messageToolbar = `${commande.acheteur.entreprise} a déjà choisi le stand ${commande.stand.idStand}`;
  } else {
    messageToolbar = `Choix du stand ${commande.typePack} pour ${commande.acheteur.entreprise}`;
  }
  return (
    <>
      <Navbar title={messageToolbar}>
        <MyButton
          href={`/commande/${commande.extId}`}
          variant="outlined"
          color="secondary"
          style={{ marginRight: "20px" }}
        >
          Espace Partenaire
        </MyButton>
      </Navbar>
      <Stack className="stand-choice" spacing={2} style={{ marginTop: "20px" }}>
        {!estCommandeImpayee && (
          <StandChoiceForm standChoice={standChoice} standCommande={commande.stand} onSave={saveChoice} />
        )}
        <StandMaps
          setStandChoice={setStandChoice}
          selectedStand={commande.stand?.idStand}
          authorizedTypes={[commande.typePack]}
          disabled={estCommandeImpayee}
        />
      </Stack>
    </>
  );
}

const StandChoiceForm: React.FC<{
  standChoice: string | null;
  standCommande?: ReservedStand;
  onSave: (data: ReservedStand) => void;
}> = ({ standChoice, standCommande, onSave }) => {
  const [typeMoquetteSelectionnee, setTypeMoquetteSelectionnee] = useState<string | null>(
    standCommande?.typeMoquette || null
  );
  const [email, setEmail] = useState<string>("");

  const isEmailValid = /.+@.+\..+/.test(email);

  function submit() {
    if (!standChoice || !typeMoquetteSelectionnee || !isEmailValid) {
      throw new Error("Formulaire invalide");
    }
    onSave({ idStand: standChoice, typeMoquette: typeMoquetteSelectionnee, email });
  }

  return (
    <Container>
      <Stack spacing={3}>
        <Stack direction="row" spacing={5} alignItems="center">
          <h2>Stand choisi:</h2>
          {standChoice != null ? <h2>{standChoice}</h2> : <span>Cliquez sur le stand souhaité ci-dessous</span>}
        </Stack>
        <Stack>
          <h2>
            Moquette choisie: <span style={{ marginLeft: "20px" }}>{typeMoquetteSelectionnee}</span>
          </h2>
          <Stack direction="row" spacing={5}>
            {TYPES_MOQUETTE.map((typeMoquette) => (
              <Tooltip key={typeMoquette} title={typeMoquette}>
                <div
                  className={classNames(
                    "carre-moquette",
                    typeMoquette,
                    typeMoquette === typeMoquetteSelectionnee && "selected"
                  )}
                  onClick={() => setTypeMoquetteSelectionnee(typeMoquette)}
                ></div>
              </Tooltip>
            ))}
          </Stack>
        </Stack>
        <TextField
          required
          focused
          color={isEmailValid || email == "" ? "info" : "error"}
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label={"Email"}
          placeholder={"Email"}
          inputMode={"email"}
          type={"email"}
        />
        <div>
          <Button
            disabled={!standChoice || !typeMoquetteSelectionnee || !isEmailValid}
            onClick={submit}
            variant="contained"
            color="secondary"
            style={{ margin: "20px 0" }}
          >
            Enregistrer mon choix
          </Button>
        </div>
      </Stack>
    </Container>
  );
};

function useStandList() {
  const { stands: serviceStands } = useServices();
  const { data: stands, isLoading, error } = useQuery(`stands-list`, () => serviceStands.standList());
  return { stands, isLoading, error };
}

function useCommande() {
  const { partenaires } = useServices();
  const { idCommande } = useParams();
  if (!idCommande) {
    return { error: new Error("Id de commande invalide"), isLoading: false };
  }
  const { data: commande, isLoading, error } = useQuery(`commande`, () => partenaires.consulterCommande(idCommande));
  return { commande, isLoading, error };
}
