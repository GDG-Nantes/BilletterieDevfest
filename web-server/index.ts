import cors from "cors";
import express from "express";
import { authMiddleware } from "./auth";
import { BilletWebApi } from "./billetweb/api";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => res.send({ status: "UP" }));

const adminRouter = express.Router();
app.use("/admin-api", adminRouter);
adminRouter.use(authMiddleware);

adminRouter.get("/sponsors", async (req, res) => {
  const attendees = await BilletWebApi.getSponsors();
  res.send(attendees);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Silence, ça tourne sur ${PORT}.`));
