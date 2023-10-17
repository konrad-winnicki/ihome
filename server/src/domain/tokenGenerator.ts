import jwt from "jsonwebtoken";
import sanitizedConfig from "../../config/config";
import { v4 } from "uuid";

export function tokenGenerator():Promise<string> {
  return new Promise<string>((resolve) => {
    const token = jwt.sign({ sessionId: v4() }, sanitizedConfig.JWT_SECRET, {
      expiresIn: "360s",
    });
    resolve(token);
  }).catch((error) => Promise.reject(error));
}