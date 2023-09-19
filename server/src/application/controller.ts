// import { PlayerDocument } from "./mongoDbModel";
import { Request, Response, NextFunction } from "express";
import { User } from "../domain/User";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import sanitizedConfig from "../../config/config";
import { UserService } from "./UserService";
import { ChatRoomService } from "./ChatRoomService";
import { ChatRoom } from "../domain/ChatRoom";
import qs from "qs";
import axios from "axios";

interface GoogleIdToken extends JwtPayload {
  email: string;
  given_name: string;
}

export function userControllers(userService: UserService) {
  function prepareCustomToken(userId: string, nickName: string): string {
    const token = jwt.sign({ userId, nickName }, sanitizedConfig.JWT_SECRET, {
      expiresIn: "60s",
    });
    return token;
  }

  async function exchangeCodeToToken(code: string) {
    const url = sanitizedConfig.EXCHANGE_TOKEN_URI;
    const values = {
      code,
      client_id: sanitizedConfig.CLIENT_ID,
      client_secret: sanitizedConfig.CLIENT_SECRET,
      redirect_uri: sanitizedConfig.CALLBACK_URL,
      grant_type: "authorization_code",
    };

    try {
      const response = await axios.post(url, qs.stringify(values), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      return response.data;
    } catch (error) {
      throw new Error("Code exchange failed");
    }
  }

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

  const handleGoogleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let customToken: string;
      const code = req.query.code as string;
      const { id_token } = await exchangeCodeToToken(code);
      const decodedIdToken = jwt.decode(id_token) as GoogleIdToken;

      const user = await userService.findUserByEmail(decodedIdToken.email);

      if (!user) {
        const id = v4();
        const registrationDate = new Date();
        const newUser = new User(
          id,
          decodedIdToken.email,
          decodedIdToken.given_name,
          registrationDate,
          null
        );
        userService.createUser(newUser);
        customToken = prepareCustomToken(id, decodedIdToken.given_name);
      } else {
        customToken = prepareCustomToken(user.id, user.nickName);
      }

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
    handleGoogleLogin,
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
        if (chatRooms) {
          return res.status(200).json(chatRooms);
        }
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
        return res.status(201).json({ chat_id: response });
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
