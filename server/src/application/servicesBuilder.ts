import { UserDbManager } from "../infractructure/database/databaseManagers/userDbManager";
import { ChatRoomDbManager } from "../infractructure/database/databaseManagers/chatRoomDbManager";
import { UserService } from "./UserService";
import { User } from "../domain/User";
import {
  ChatRoomSchema,
  UserSchema,
} from "../infractructure/database/mongoDbModel";
import { Connection } from "mongoose";
import { ChatRoom } from "../domain/ChatRoom";
import { ChatRoomService } from "./ChatRoomService";
import { ServiceBuilderDependencias } from "../types";

export function buildServices(
  connection: Connection
): ServiceBuilderDependencias {
  const userDocument = connection.model<User>("User", UserSchema);
  const chatRoomDocument = connection.model<ChatRoom>(
    "ChatRoom",
    ChatRoomSchema
  );

  if (!userDocument || !chatRoomDocument || !connection) {
    throw new Error("connection and documents must exist");
  }
  const userManager = new UserDbManager(userDocument);
  const chatRoomManager = new ChatRoomDbManager(chatRoomDocument);
  const userService = new UserService(userManager);
  const chatRoomService = new ChatRoomService(chatRoomManager);

  return {
    userService: userService,
    chatRoomService: chatRoomService,
  };
}
