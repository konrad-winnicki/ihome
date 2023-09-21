import { Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import sanitizedConfig from "../../../config/config";
import { CustomSocketAttributes } from "../../../types";

export const socketAuthentication = (
  socket: Socket,
  next: (arg?: Error) => void
) => {
  const token = socket.handshake.auth.token;
  try {
    const decodedToken = jwt.verify(token, sanitizedConfig.JWT_SECRET, {
      ignoreExpiration: false,
    }) as JwtPayload;
    (socket as CustomSocketAttributes).token = decodedToken;
    next();
  } catch (error) {
    if (error === "jwt expired") {
      next(new Error("jwt expired"));
    }
    next(new Error("Socket authentication error"));
  }
};
