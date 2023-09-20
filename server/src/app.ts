import "dotenv/config";
import { buildServices } from "./application/servicesBuilder";
import { initRoutes } from "./routes";
import express, { NextFunction, Request, Response} from "express";
import { chatRoomControllers, userControllers } from "./application/controller";
import { Connection } from "mongoose";
import { IncomingMessage, ServerResponse, createServer } from "http";
import * as httpLibrary from "http";
import { socketSetup } from "./socketSetup";
import { appSetup } from "./appSetup";
import sanitizedConfig from "../config/config";
import { connectDatabase } from "./infractructure/mongoDbConnection";


export type UserRootControllers = {
  handleLogin: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response | undefined>;

  handleGoogleLogin: (req: Request, res: Response, next: NextFunction) => void;

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
  server: httpLibrary.Server<typeof IncomingMessage, typeof ServerResponse>;
  connection: Connection;
  constructor(server: httpLibrary.Server, connection: Connection) {
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
    sanitizedConfig.NODE_ENV === "test" ? sanitizedConfig.TEST_DATABASE : sanitizedConfig.DATABASE;
  return startServer(databaseName);
}

async function startServer(databaseName: string) {
  const connection = await connectDatabase(sanitizedConfig.MONGO_URI, databaseName).asPromise()
  const services = buildServices(connection);
  const userRootControllers = userControllers(services.userService);
  const chatRoomRootControllers = chatRoomControllers(services.chatRoomService);
  const app = express();
  const router = express.Router();
  const httpServer = createServer(app);
  await initRoutes(router, userRootControllers, chatRoomRootControllers);
  await appSetup(app, router);
  await socketSetup(httpServer)

  const server = httpServer.listen(sanitizedConfig.PORT, () => {
    console.log(`Server is listening on port ${sanitizedConfig.PORT}! 🍄 `);
  });

  return new Application(server, connection);
}
