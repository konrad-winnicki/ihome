import { ChatRoomInterface } from "../../../application/ChatRoomInterface";
import { ChatRoom } from "../../../domain/ChatRoom";
import { Model } from "mongoose";
import { mongo } from "mongoose";
import { ChatRoomList } from "../../../domain/ChatRoomList";

export class ChatRoomDbManager implements ChatRoomInterface {
  private chatRoomDocument: Model<ChatRoom>;
  constructor(chatRoomDocument: Model<ChatRoom>) {
    this.chatRoomDocument = chatRoomDocument;
  }

  async createChatRoom(chatRoom: ChatRoom): Promise<string> {
    const newChatRoom = {
      id: chatRoom.id,
      name: chatRoom.name,
      ownerId: chatRoom.ownerId,
      participants: [],
      creationDate: chatRoom.creationDate,
    };
    try {
      const chatRoomFromDB = await this.chatRoomDocument.create(newChatRoom);
      return chatRoomFromDB.id;
    } catch (err) {
      if (err instanceof mongo.MongoServerError) {
        this.uniqueViolationErrorHandler(err);
      }
      throw err;
    }
  }

  async getChatRoomList(): Promise<ChatRoomList> {
    const chatRoomsFromDB = await this.chatRoomDocument
      .find()
      .sort({ name: 1 });

    const chatRooms = chatRoomsFromDB.map((chatRoomFromDB: ChatRoom) => {
      const chatRoom = new ChatRoom(
        chatRoomFromDB.id,
        chatRoomFromDB.name,
        chatRoomFromDB.ownerId,
        chatRoomFromDB.creationDate
      );
      return chatRoom;
    });

    const chatRoomList = new ChatRoomList(chatRooms);
    return chatRoomList;
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("name")) {
      throw new Error("NameConflictError");
    }

    throw err;
  }
}
