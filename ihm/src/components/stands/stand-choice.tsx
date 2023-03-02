import { Button, Container, Grid, Stack, TextField, Tooltip } from "@mui/material";
import React, { MouseEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { ReservedStand, Stand, TypePack } from "../../../../web-server/interfaces/types";
import { TYPES_MOQUETTE } from "../../../../web-server/interfaces/constantes";
import { useServices } from "../../services";

import "./stand-choice.scss";
import { MyButton } from "../links";
import classNames from "classnames";
import { Navbar } from "../../layout/layout";

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
      .then(() => window.alert("Choix bien enregistré"))
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
        <Grid container spacing={2}>
          <Grid item md={7} xs={12}>
            <SvgMap
              disabled={estCommandeImpayee}
              url="/map1.svg"
              stands={stands}
              onClick={setStandChoice}
              selectedStand={commande.stand?.idStand}
              authorizedTypes={[commande.typePack]}
            />
          </Grid>
          <Grid item md={4.5} xs={12}>
            <SvgMap
              disabled={estCommandeImpayee}
              url="/map2.svg"
              stands={stands}
              onClick={setStandChoice}
              selectedStand={commande.stand?.idStand}
              authorizedTypes={[commande.typePack]}
            />
          </Grid>
        </Grid>
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

interface MapProps {
  url: string;
  stands: Stand[] | undefined;

  onClick(stand: string): void;

  selectedStand?: string;
  authorizedTypes: TypePack[];
  disabled?: boolean;
}

const SvgMap = React.memo(function SvgMapRaw({
  url,
  stands,
  onClick,
  authorizedTypes,
  selectedStand,
  disabled,
}: MapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<string | null>(null);
  const { selectStandNode, markStandNode } = useStandNode({ map, ref, stands, authorizedTypes });

  useEffect(() => {
    fetch(url)
      .then((res) => res.text())
      .then(setMap);
  }, [url]);

  useEffect(() => {
    if (selectedStand) {
      markStandNode(selectedStand);
    }
  }, [selectedStand, markStandNode]);

  const onMapClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!disabled) {
      const foundStand = selectStandNode(event);
      if (foundStand) {
        onClick(foundStand);
      }
    }
  };

  return (
    <div
      ref={ref}
      className={classNames("map", disabled && "disabled")}
      onClick={onMapClick}
      data-map-url={url}
      dangerouslySetInnerHTML={{ __html: map ?? "" }}
    ></div>
  );
});

interface UseStandNodeMapProps {
  map: string | null;
  stands: Stand[] | undefined;
  ref: React.RefObject<HTMLDivElement>;
  authorizedTypes: TypePack[];
}

function matchesAnyPackTypes(currentPotentialStandId: string, authorizedTypes: TypePack[]) {
  const prefixByTypes: { [k in TypePack]?: string } = {
    PLATINIUM: "P",
    SILVER: "S",
    GOLD: "G",
  };
  return authorizedTypes.some((type) => currentPotentialStandId.startsWith(prefixByTypes[type] || ""));
}

function useStandNode({ map, stands, ref, authorizedTypes }: UseStandNodeMapProps) {
  const availableStandIds: string[] = useMemo(() => stands?.map((s) => s.id) ?? [], [stands]);
  const [nodeMap, setNodeMap] = useState<Map<Element, string>>(new Map());
  const [standGroups, setStandGroups] = useState<Record<string, Element[]>>({});

  useEffect(() => {
    // skip if map of stands not loaded
    if (!map || availableStandIds.length === 0) {
      return;
    }
    const standGroups: Record<string, Element[]> = {};
    const otherGroups: Element[] = [];
    // grab from DOM every "root" g node
    // we know the svg DOM structure so we can do it like this
    // for every g node, we check if we can directly determine the stand from text content
    ref.current?.querySelectorAll("svg > g > g, svg > g > path").forEach((group) => {
      const currentPotentialStandId = (group.textContent ?? "").trim().replaceAll("\n", "");

      if (
        availableStandIds.includes(currentPotentialStandId) &&
        matchesAnyPackTypes(currentPotentialStandId, authorizedTypes)
      ) {
        if (!standGroups[currentPotentialStandId]) {
          standGroups[currentPotentialStandId] = [];
        }
        standGroups[currentPotentialStandId].push(group);
      } else {
        otherGroups.push(group);
      }
    });
    // as we know which stand has been found on the map,
    // we can try to group every node representing the same stand
    // for that we check if the center of every unknown g node is positioned
    // inside the known stand node
    const foundStands = Object.keys(standGroups);
    otherGroups.forEach((elt) => {
      const elementRect = elt.getBoundingClientRect();
      const centerPositionY = elementRect.top + elementRect.height / 2;
      const centerPositionX = elementRect.left + elementRect.width / 2;
      const forStand = foundStands.find((standId) => {
        const standGroup = standGroups[standId][0];
        const {
          top: standGroupTop,
          bottom: standGroupBottom,
          left: standGroupLeft,
          right: standGroupRight,
        } = standGroup.getBoundingClientRect();
        return (
          standGroupTop <= centerPositionY &&
          centerPositionY <= standGroupBottom &&
          standGroupLeft <= centerPositionX &&
          centerPositionX <= standGroupRight
        );
      });
      if (forStand) {
        standGroups[forStand].push(elt);
      } else {
        elt.classList.add("disabled-element");
      }
    });
    setStandGroups(standGroups);
  }, [map, availableStandIds]);

  useEffect(() => {
    // we convert the element list for each stand in a map that we can used easily later
    const elementMap: Map<Element, string> = new Map();
    Object.entries(standGroups).forEach(([standId, elements]) => {
      elements.forEach((elt) => {
        elementMap.set(elt, standId);
      });
    });
    setNodeMap(elementMap);
  }, [standGroups]);

  useEffect(() => {
    for (const [elt] of nodeMap.entries()) {
      elt.classList.add("stand-element");
    }
  }, [nodeMap]);

  useEffect(() => {
    Object.entries(standGroups).forEach(([standId, elements]) => {
      const standInfos = stands?.find((s) => s.id === standId);
      elements.forEach((elt) => {
        elt.setAttribute("data-reserved", String(standInfos?.reserved));
      });
    });
  }, [standGroups, stands]);

  const markStandNode = React.useCallback(
    (standId: string) => {
      console.log(ref.current);
      ref.current?.querySelectorAll("svg > g > g[data-selected]").forEach((elt) => {
        elt.removeAttribute("data-selected");
        elt.removeAttribute("data-container");
      });
      const elements = standGroups[standId];
      console.log(elements);
      elements?.forEach((elt) => elt.setAttribute("data-selected", ""));
      elements?.sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return bRect.width * bRect.height - aRect.width * aRect.height;
      });
      elements?.[0]?.setAttribute("data-container", "");
    },
    [standGroups]
  );

  const selectStandNode = (event: any): string | null => {
    let found: string | null = null;
    // we try from text content (faster)
    const textContent = event.target.textContent;
    if (availableStandIds.includes(textContent) && matchesAnyPackTypes(textContent, authorizedTypes)) {
      console.log("CLICK", event.target, textContent, "(with textContent)");
      found = textContent;
    }
    // then we try node map (slower)
    if (!found) {
      const stand = [...nodeMap.entries()].find(([elt]) => elt === event.target || elt.contains(event.target));
      if (stand) {
        console.log("CLICK", event.target, stand[1], "(with node map)");
        found = stand[1];
      }
    }

    const standInfos = stands?.find((s) => s.id === found);
    if (!found || !standInfos || standInfos.reserved) {
      console.log("CLICK", event.target, "no stand found");
      return null;
    }

    markStandNode(found);
    return found;
  };

  return { selectStandNode, markStandNode };
}
