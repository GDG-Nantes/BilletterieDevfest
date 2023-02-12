import { NextFunction, Request, Response } from "express";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { CONFIG } from "./config";

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

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (CONFIG.isAuthDisabled) {
    next();
  } else {
    const idToken = req.headers.authorization?.replace("Bearer ", "");
    if (idToken == null) {
      throwAuthError(res);
    } else {
      try {
        const loginTicket = await oAuth2Client.verifyIdToken({ idToken });
        let payload = loginTicket.getPayload() as Required<TokenPayload>;
        if (
          payload?.hd === "gdgnantes.com" ||
          payload.email === "pena.anthony49@gmail.com"
        ) {
          req.auth = payload;
          next();
        } else {
          throwAuthError(res, "UNAUTHORIZED");
        }
      } catch (error) {
        console.error(error);
        throwAuthError(res, "Error validating token");
      }
    }
  }
}
