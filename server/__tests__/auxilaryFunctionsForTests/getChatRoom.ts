import { ChatRoom } from "../../src/domain/ChatRoom";
import { ChatRoomSchema } from "../../src/infractructure/database/mongoDbModel";
import { Connection } from "mongoose";
export async function getChatRoomFromDB(connection: Connection, name: string) {
  const chatRoomDocument = connection.model<ChatRoom>(
    "ChatRoom",
    ChatRoomSchema
  );
  const chatRoomDetails = await chatRoomDocument.findOne({
    name: name,
  });
  return chatRoomDetails;
}
