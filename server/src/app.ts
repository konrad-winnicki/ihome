import "dotenv/config";
import config from "../config/config";
import { buildServices } from "./application/servicesBuilder";
import cors from "cors";
import { initRoutes } from "./routes";
//import { errorHandler } from "./errorHandler";
import express, { NextFunction, Request, Response, Router } from "express";
import { Express } from "express-serve-static-core";
import { chatRoomControllers, userControllers } from "./application/controller";
import { Connection } from "mongoose";
import { IncomingMessage, ServerResponse, createServer } from "http";
import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import sanitizedConfig from "../config/config";
import { v4 } from "uuid";

interface CustomSocket extends Socket {
  token: JwtPayload; // Add your custom properties here
}
export type UserRootControllers = {
  handleLogin: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response | undefined>;
  postUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response | undefined>;
};

export type ChatRoomRootControllers = {
  postChatRoom: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response | undefined>;

  getChatRoomList: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
};

export class Application {
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
  connection: Connection;
  constructor(server: Server, connection: Connection) {
    this.server = server;
    this.connection = connection;
  }

  public stop() {
    this.server.close();
    this.connection.close();
  }
}

export async function applicationStart() {
  const databaseName =
    config.NODE_ENV === "test" ? config.TEST_DATABASE : config.DATABASE;
  return startServer(databaseName);
}

export async function appSetup(app: Express, router: Router) {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", router);

  /*app.use(
    (
      error: Error,
      _request: Request,
      response: Response,
      next: NextFunction
    ) => {
      errorHandler(error, response, next);
    }
  );

  */
}

async function startServer(databaseName: string) {
  const services = buildServices();

  const userRootControllers = userControllers(services.userService);
  const chatRoomRootControllers = chatRoomControllers(services.chatRoomService);
  const app = express();
  const router = express.Router();
  await initRoutes(router, userRootControllers, chatRoomRootControllers);
  await appSetup(app, router);
  console.log("aaaaaaaa");

  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("moj", socket.handshake.auth.room);
    try {
      const decodedToken = jwt.verify(token, sanitizedConfig.JWT_SECRET, {
        ignoreExpiration: false,
      }) as JwtPayload;

      (socket as CustomSocket).token = decodedToken;
      next();
    } catch (error) {
      if (error === "jwt expired") {
        console.log("jwt expired");
        //next(error)
      }
      console.log("no token or bad token");
      //next(error);
    }
  });
  io.on("connection", (socket) => {
    const nickName = (socket as CustomSocket).token.nickName;
    const roomId = socket.handshake.auth.room;
    socket.join(roomId);
    console.log(`⚡: ${nickName} just connected!`);
    io.emit("connected", { socketId: socket.id, nickName: nickName });
    socket.on("messag", (msg) => {
      console.log(msg);
      //const decodedToken = jwt.verify(socket.handshake.auth.token, sanitizedConfig.JWT_SECRET, {
      //  ignoreExpiration: false,
      // }) as JwtPayload;
      // console.log(decodedToken.nickName)
      io.to(roomId).emit("messag", msg);
    });

    socket.on("roomAdded", (msg) => {
      console.log(msg);
      //const decodedToken = jwt.verify(socket.handshake.auth.token, sanitizedConfig.JWT_SECRET, {
      //  ignoreExpiration: false,
      // }) as JwtPayload;
      // console.log(decodedToken.nickName)
      io.emit("roomAdded", "roomAdded");
    });


    socket.on("disconnect", (reason) => {
      io.emit("disconnected", {
        reason: reason,
        socketId: socket.id,
        nickName: nickName,
      });

      console.log(`🔥: ${nickName} disconnected`, reason);
    });
  });

  const server = httpServer.listen(config.PORT, () => {
    console.log(`Server is listening on port ${config.PORT}! 🍄 `);
  });

  //return new Application(server, services.connection);
}
