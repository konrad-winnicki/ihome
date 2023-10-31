import jwt from "jsonwebtoken";
import { v4 } from "uuid";
//import appConfiguration from "../../config/sanitizedProperties";


export function tokenGenerator():Promise<string> {
  return new Promise<string>((resolve) => {
    const token = jwt.sign({ sessionId: v4() }, appConfiguration.JWT_SECRET, {
      expiresIn: "360s",
    });
    resolve(token);
  }).catch((error) => Promise.reject(error));
}