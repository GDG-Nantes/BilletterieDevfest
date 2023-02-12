import cors from "cors";
import express from "express";

export const app = express();
app.use(express.json());
app.use(cors());

process.on("unhandledRejection", (reason: Error | any) => {
  console.error(`Unhandled Rejection: ${reason.message || reason}`);
});

app.get("/health", (req, res) => res.send({ status: "UP" }));

app.use("/admin-api", require("./admin/router").default);

app.use("/api", require("./partenaires/router").default);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Silence, ça tourne sur ${PORT}.`));
