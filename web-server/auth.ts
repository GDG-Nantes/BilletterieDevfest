import { NextFunction, Request, Response } from "express";
import { OAuth2Client, TokenPayload } from "google-auth-library";

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
}
