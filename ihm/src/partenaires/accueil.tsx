import React, { useState } from "react";

export const Accueil: React.FC = () => {
  const [map, setMap] = useState<string | null>(null);
  React.useEffect(() => {
    fetch("/map1-convertico.svg")
      .then((res) => res.text())
      .then(setMap);
  }, []);
  return <div dangerouslySetInnerHTML={{ __html: map ?? "" }}></div>;
  // window.location.href = "https://devfest2023.gdgnantes.com";
  // return null;
};
