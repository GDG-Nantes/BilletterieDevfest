import cors from "cors";
import express from "express";
import { adminRouter } from "./admin/sponsors";
import { authMiddleware } from "./auth";
import { routerPartenaires } from "./partenaires";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => res.send({ status: "UP" }));

app.use("/admin-api", adminRouter);
adminRouter.use(authMiddleware);

app.use("/api", routerPartenaires);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Silence, ça tourne sur ${PORT}.`));
