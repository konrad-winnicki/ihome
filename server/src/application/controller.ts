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
import url from "url";

interface IdToken extends JwtPayload {
  email: string;
  given_name: string;
}

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
      const token = jwt.sign(
        { userId: user.id, nickName: user.nickName },
        sanitizedConfig.JWT_SECRET,
        {
          expiresIn: "600s",
        }
      );
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
      //res.statusCode = 302;
      console.log("oauth", req.query.code);
      const code = req.query.code as string;
      const { id_token, access_token } = await exchangeCodeToToken(code);
      const decodedIdToken = jwt.decode(id_token) as IdToken;
      //console.log('google', decodedIdToken)
      const user = await userService.findUserByEmail(decodedIdToken.email);
      let token: string;
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
        token = prepareToken(id, decodedIdToken.given_name);
      } else {
        token = prepareToken(user.id, user.nickName);
      }

      console.log(jwt.decode(token));

      res.redirect(`http://localhost:5173/api/chatroom?token=${token}`)
     
    } catch (error) {
      next(error);
    }
  };

  /*
  const getPlayers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    playerService
      .getPlayerList()
      .then((chatRooms) => {
        if (chatRooms) {
          return res.status(200).json(chatRooms);
        }
      })
      .catch((err) => {
        next(err);
        //in which scenario we will return this and what will be err.message???
        //return res.status(404).json({ error: err.message, error_code: "GP001" });
      });
  };
*/
  const postUser = async (req: Request, res: Response, next: NextFunction) => {
    if (!("email" in req.body) || !("password" in req.body)) {
      return res
        .status(400)
        .json({ Bad_reqest: "email and password required" });
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
        return res.status(201).json({ Player_id: response });
      })
      .catch((err: Error) => {
        next(err);
      });
  };

  /*
  const changeName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const playerId = req.params.id;
    const newName = req.body.name;
    try {
      const player = await playerService.changeName(playerId, newName);
      return res.status(200).json(player);
    } catch (err) {
      next(err);
    }
  };
*/

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
        //in which scenario we will return this and what will be err.message???
        //return res.status(404).json({ error: err.message, error_code: "GP001" });
      });
  };

  const postChatRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log("psotCharRoom");
    if (!("ownerId" in req.body)) {
      return res.status(400).json({ Bad_reqest: "owner id required" });
    }
    const { ownerId, chatName } = req.body;
    const id = v4();
    const creationDate = new Date();
    const newChatRoom = new ChatRoom(id, chatName, ownerId, [], creationDate);
    chatRoomService
      .createChatRoom(newChatRoom)
      .then((response) => {
        return res.status(201).json({ chat_id: response });
      })
      .catch((err: Error) => {
        next(err);
      });
  };

  /*
  const changeName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const playerId = req.params.id;
    const newName = req.body.name;
    try {
      const player = await playerService.changeName(playerId, newName);
      return res.status(200).json(player);
    } catch (err) {
      next(err);
    }
  };
*/

  return {
    postChatRoom,
    getChatRoomList,
  };
}

async function exchangeCodeToToken(code: string) {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: sanitizedConfig.CLIENT_ID,
    client_secret: sanitizedConfig.CLIENT_SECRET,
    redirect_uri: sanitizedConfig.REDIRECT_URL,
    grant_type: "authorization_code",
  };

  try {
    const res = await axios.post(url, qs.stringify(values), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

function prepareToken(userId: string, nickName: string): string {
  const token = jwt.sign(
    { userId: userId, nickName: nickName },
    sanitizedConfig.JWT_SECRET,
    {
      expiresIn: "600s",
    }
  );
  return token;
}
