import { Server } from "socket.io";
import sanitizedConfig from "../../../config/config";
import * as httpLibrary from "http";
import { socketAuthentication } from "../middleware/socketAuth";
import { CustomSocketAttributes } from "../../../types";
import { roomHandler } from "./roomHandler";
import { personHandler } from "./personHandler";

export async function socketSetup(httpServer: httpLibrary.Server) {
  const io = new Server(httpServer, {
    cors: {
      origin: sanitizedConfig.SOCKET_ORIGIN,
    },
  });

  io.use(socketAuthentication);
  io.on("connection", (socket) => {
    const nickName = (socket as CustomSocketAttributes).token.nickName;
    console.log(`⚡: ${nickName} just connected!`);

    roomHandler(io, socket);
    personHandler(io, socket);
  });
}
