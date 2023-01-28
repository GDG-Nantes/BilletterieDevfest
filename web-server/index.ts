import cors from "cors";
import express from "express";
import { BilletWebApi } from "./billetweb/api";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => res.send({ status: "UP" }));

app.get("/sponsors", async (req, res) => {
  const attendees = await BilletWebApi.getSponsors();
  res.send(attendees);
});

const PORT = 8081;
app.listen(PORT, () => console.log(`Silence, ça tourne sur ${PORT}.`));
