import {
  ChatRoomMongoDbManager,
  UserMongoDbManager,
} from "../infractructure/mongoDbManager";
import { UserService } from "./UserService";
import { User } from "../domain/User";
import { ChatRoomSchema, UserSchema } from "../infractructure/mongoDbModel";
import { Connection } from "mongoose";
import { ChatRoom } from "../domain/ChatRoom";
import { ChatRoomService } from "./ChatRoomService";

export type Dependencias = {
  userService: UserService;
  chatRoomService: ChatRoomService;
};



export function buildServices(connection: Connection ): Dependencias {
  
  const userDocument = connection.model<User>("User", UserSchema);
  const chatRoomDocument = connection.model<ChatRoom>(
    "ChatRoom",
    ChatRoomSchema
  );

  if (!userDocument || !connection) {
    throw new Error("connection and documents must exist");
  }
  const userManager = new UserMongoDbManager(userDocument);
  const chatRoomManager = new ChatRoomMongoDbManager(chatRoomDocument);
  const userService = new UserService(userManager);
  const chatRoomService = new ChatRoomService(chatRoomManager);

  return {
    userService: userService,
    chatRoomService: chatRoomService,
  };
}
