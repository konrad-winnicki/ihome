import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import { sessionStore } from "../infrastructure/sessions/sessionStorage";
import { CustomSessionData } from "../controllers/LoginController";
const MINUTES = 60
export const tokenExpirationTimeInSeconds = MINUTES * 60;

export async function tokenGenerator(deviceIdentifier:string): Promise<string> {
  return new Promise<string>((resolve) => {
    const sessionId= v4()
    const token = jwt.sign({ sessionId }, appConfiguration.JWT_SECRET, {
      expiresIn: tokenExpirationTimeInSeconds,
    });
  sessionStore.set(sessionId, {deviceIdentifier} as unknown as CustomSessionData)
    resolve(token);
  });
}
