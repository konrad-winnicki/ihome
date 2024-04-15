import jwt from "jsonwebtoken";
import { v4 } from "uuid";

const MINUTES = 60
export const tokenExpirationTimeInSeconds = MINUTES * 60;

export async function tokenGenerator(): Promise<string> {
  return new Promise<string>((resolve) => {
    const token = jwt.sign({ sessionId: v4() }, appConfiguration.JWT_SECRET, {
      expiresIn: tokenExpirationTimeInSeconds,
    });
    resolve(token);
  });
}
