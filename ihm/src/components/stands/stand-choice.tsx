import { Button, Grid } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Stand } from "../../../../web-server/interfaces/types";
import { useServices } from "../../services";

import "./stand-choice.css";

export function StandChoice() {
  const { stands } = useStandList();
  const { standChoice, setStandChoice, saveChoice } = useStandChoice();
  return (
    <Grid container className="stand-choice">
      <Grid item xs={3}>
        <h1>Choix du stand</h1>
        <p>Stand choisi: {standChoice}</p>
        <Button disabled={!standChoice} onClick={saveChoice}>
          Enregistrer mon choix
        </Button>
      </Grid>
      <Grid item xs={9}>
        <SvgMap url="/map1.svg" stands={stands} onClick={setStandChoice} />
        <SvgMap url="/map2.svg" stands={stands} onClick={setStandChoice} />
      </Grid>
    </Grid>
  );
}

function useStandList() {
  const { stands: serviceStands } = useServices();
  const { data: stands, isLoading, error } = useQuery(`stands-list`, () => serviceStands.standList());
  return { stands, isLoading, error };
}

function useStandChoice() {
  const { stands: serviceStands } = useServices();
  const { idCommande } = useParams();
  const navigate = useNavigate();
  const [standChoice, setStandChoice] = useState<string | null>(null);
  const saveChoice = () => {
    if (!idCommande) {
      throw new Error("idCommande is missing");
    }
    if (!standChoice) {
      throw new Error("standChoice is missing");
    }
    serviceStands
      .saveChoice(idCommande, standChoice)
      .then(() => navigate(`/stands/${idCommande}/${standChoice}`))
      .catch((err) => console.error(err));
  };
  return { standChoice, setStandChoice, saveChoice };
}

interface MapProps {
  url: string;
  stands: Stand[] | undefined;
  onClick(stand: string): void;
}

const SvgMap = React.memo(function SvgMapRaw({ url, stands, onClick }: MapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<string | null>(null);
  const { selectStandNode } = useStandNode({ map, ref, stands });

  useEffect(() => {
    fetch(url)
      .then((res) => res.text())
      .then(setMap);
  }, [url]);

  const onMapClick = (event: any) => {
    const foundStand = selectStandNode(event);
    if (foundStand) {
      onClick(foundStand);
    }
  };

  return (
    <div
      ref={ref}
      className="map"
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
}

function useStandNode({ map, stands, ref }: UseStandNodeMapProps) {
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
    ref.current?.querySelectorAll("svg > g > g").forEach((group) => {
      const currentPotentialStandId = (group.textContent ?? "").trim().replaceAll("\n", "");
      if (availableStandIds.includes(currentPotentialStandId)) {
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

  const markStandNode = (standId: string) => {
    document.querySelectorAll("svg > g > g[data-selected]").forEach((elt) => {
      elt.removeAttribute("data-selected");
      elt.removeAttribute("data-container");
    });
    const elements = standGroups[standId];
    elements.forEach((elt) => elt.setAttribute("data-selected", ""));
    elements.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return bRect.width * bRect.height - aRect.width * aRect.height;
    });
    elements[0].setAttribute("data-container", "");
  };

  const selectStandNode = (event: any): string | null => {
    let found: string | null = null;
    // we try from text content (faster)
    const textContent = event.target.textContent;
    if (availableStandIds.includes(textContent)) {
      console.log("CLICK", event.target, textContent, "(with textContent)");
      found = textContent;
    }
    // then we try node map (slower)
    const stand = [...nodeMap.entries()].find(([elt]) => elt === event.target || elt.contains(event.target));
    if (stand) {
      console.log("CLICK", event.target, stand[1], "(with node map)");
      found = stand[1];
    }

    const standInfos = stands?.find((s) => s.id === found);
    if (!found || !standInfos || standInfos.reserved) {
      console.log("CLICK", event.target, "no stand found");
      return null;
    }

    markStandNode(found);
    return found;
  };

  return { selectStandNode };
}
