import { Request, Response, NextFunction } from "express";
import { User } from "../../domain/User";
import { v4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sanitizedConfig from "../../../config/config";
import { UserService } from "../../application/UserService";
import { ChatRoomService } from "../../application/ChatRoomService";
import { ChatRoom } from "../../domain/ChatRoom";
import {
  prepareCustomToken,
  exchangeCodeToToken,
  createUserWithGoogleData,
} from "./auxilaryFunctions";
import { GoogleIdToken } from "../../types";

export function userControllers(userService: UserService) {
  const handleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;
      const user = await userService.findUserByEmail(email);
      if (!user) {
        return res
          .status(401)
          .json({ error: "no player found with this email" });
      }
      const passwordMatch = await bcrypt.compare(
        password,
        user.password as string
      );
      if (!passwordMatch) {
        return res.status(401).json({ error: "authentication failed" });
      }
      const token = prepareCustomToken(user.id, user.nickName);
      return res.json({ token: token, name: user.nickName, id: user.id });
    } catch (error) {
      next(error);
    }
  };

  const handleGoogleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const code = req.query.code as string;
      const { id_token } = await exchangeCodeToToken(code);
      const decodedIdToken = jwt.decode(id_token) as GoogleIdToken;
      const { id, nickName } = await createUserWithGoogleData(
        userService,
        decodedIdToken
      );
      const customToken = prepareCustomToken(id, nickName);
      res
        .cookie("token", customToken)
        .redirect(sanitizedConfig.REDIRECT_URL_WITH_TOKEN);
    } catch (error) {
      next(error);
    }
  };

  const postUser = async (req: Request, res: Response, next: NextFunction) => {
    if (
      !("email" in req.body) ||
      !("password" in req.body) ||
      !("nickName" in req.body)
    ) {
      return res
        .status(400)
        .json({ Bad_reqest: "Nickname, email and password required" });
    }
    const { email, password, nickName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = v4();
    const registrationDate = new Date();
    const newUser = new User(
      id,
      email,
      nickName,
      registrationDate,
      hashedPassword
    );
    userService
      .createUser(newUser)
      .then((response) => {
        return res.status(201).json({ User_id: response });
      })
      .catch((err: Error) => {
        next(err);
      });
  };

  return {
    handleLogin,
    postUser,
    handleGoogleCallback,
  };
}

export function chatRoomControllers(chatRoomService: ChatRoomService) {
  const getChatRoomList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    chatRoomService
      .getChatRoomList()
      .then((chatRooms) => {
        return res.status(200).json(chatRooms.chatRooms);
      })
      .catch((err) => {
        next(err);
      });
  };

  const postChatRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!("ownerId" in req.body)) {
      return res.status(400).json({ Bad_reqest: "owner id required" });
    }
    const { ownerId, chatName } = req.body;
    const id = v4();
    const creationDate = new Date();
    const newChatRoom = new ChatRoom(id, chatName, ownerId, creationDate);
    chatRoomService
      .createChatRoom(newChatRoom)
      .then((response) => {
        return res.status(201).json({ chatRoom_id: response });
      })
      .catch((err: Error) => {
        next(err);
      });
  };

  return {
    postChatRoom,
    getChatRoomList,
  };
}
