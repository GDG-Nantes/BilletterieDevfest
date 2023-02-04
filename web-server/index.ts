import cors from "cors";
import express, { Response } from "express";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { BilletWebApi } from "./billetweb/api";

const app = express();
app.use(express.json());
app.use(cors());

const oAuth2Client = new OAuth2Client();
function throwAuthError(res: Response, error?: unknown) {
  res.status(401).send(error || "invalid token");
}
declare global {
  namespace Express {
    interface Request {
      auth?: Required<TokenPayload>;
    }
  }
}
app.use(async (req, res, next) => {
  const idToken = req.headers.authorization?.replace("Bearer ", "");
  if (idToken == null) {
    throwAuthError(res);
  } else {
    try {
      const loginTicket = await oAuth2Client.verifyIdToken({ idToken });
      let payload = loginTicket.getPayload() as Required<TokenPayload>;
      if (payload?.hd === "gdgnantes.com") {
        req.auth = payload;
      }
      next();
    } catch (error) {
      console.error(error);
      throwAuthError(res, "Error validating token");
    }
  }
});

app.get("/health", (req, res) => res.send({ status: "UP" }));

app.get("/sponsors", async (req, res) => {
  const attendees = await BilletWebApi.getSponsors();
  res.send(attendees);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Silence, ça tourne sur ${PORT}.`));
