// import { PlayerDocument } from "./mongoDbModel";
import { Request, Response, NextFunction } from "express";
import { User } from "../domain/User";
import {v4} from 'uuid'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sanitizedConfig from "../../config/config";
import { UserService } from "./UserService";
import { ChatRoomService } from "./ChatRoomService";
import { ChatRoom } from "../domain/ChatRoom";


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
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "authentication failed" });
      }
      const token = jwt.sign(
        { userId: user.id, 
        nickName: user.nickName },
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
  const postUser= async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!("email" in req.body) || !("password" in req.body)) {
      return res
        .status(400)
        .json({ Bad_reqest: "email and password required" });
    }
    const { email, password, nickName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = v4()
    const registrationDate = new Date()
    const newUser = new User(id, email, hashedPassword, nickName, registrationDate );
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

  const postChatRoom= async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log('psotCharRoom')
    if (!("ownerId" in req.body)) {
      return res
        .status(400)
        .json({ Bad_reqest: "owner id required" });
    }
    const { ownerId, chatName} = req.body;
    const id = v4()
    const creationDate = new Date()
    const newChatRoom = new ChatRoom(id, chatName, ownerId, [], creationDate)
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
    getChatRoomList
  
  };
}
