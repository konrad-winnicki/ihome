import jwt from "jsonwebtoken";
import sanitizedConfig from "../../../config/config";
import { v4 } from "uuid";

export function generateToken() {
  return new Promise((resolve) => {
    const token = jwt.sign({ sessionId: v4() }, sanitizedConfig.JWT_SECRET, {
      expiresIn: "3600s",
    });
    resolve(token);
  }).catch((error) => Promise.reject(error));
}
