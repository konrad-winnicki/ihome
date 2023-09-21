import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { UserService } from "./src/application/UserService";
import { ChatRoomService } from "./src/application/ChatRoomService";

type SocketEventMessage = {
    messageId: string;
    message: string;
  };

interface CustomSocketAttributes extends Socket {
    token: JwtPayload;
    room:string
  }

type ServiceBuilderDependencias = {
    userService: UserService;
    chatRoomService: ChatRoomService;
  };

type ChatRoomDetailsType = {
    id: string;
    chatRoomName: string | null;
    chatOwner: string;
  };

type UserRootControllers = {
    handleLogin: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<Response|undefined>;
  
    handleGoogleCallback: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => void;
  
    postUser: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<Response|undefined>;
  }
  

type ChatRoomRootControllers = {
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

  interface GoogleIdToken extends JwtPayload {
    email: string;
    given_name: string;
  }