import { Stack } from "@mui/system";
import { useParams } from "react-router-dom";

export function StandChoiceSaved() {
  const { idCommande, idStand } = useParams();
  return (
    <Stack>
      <h1>Choix de stand sauvegardé!</h1>
      <p>Nous avons enregistré que vous avez choisi le stand : {idStand}</p>
    </Stack>
  );
}
