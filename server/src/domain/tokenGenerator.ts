import jwt from "jsonwebtoken";
import { v4 } from "uuid";

export const tokenExpirationTimeInSeconds = 60 * 60;

export async function tokenGenerator(): Promise<string> {
  return new Promise<string>((resolve) => {
    const token = jwt.sign({ sessionId: v4() }, appConfiguration.JWT_SECRET, {
      expiresIn: tokenExpirationTimeInSeconds,
    });
    resolve(token);
  });
}
