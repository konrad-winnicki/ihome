import { ChatRoom } from "../domain/ChatRoom";
import { ChatRoomList } from "../domain/ChatRoomList";
import { ChatRoomInterface } from "./ChatRoomInterface";

export class ChatRoomService {
  chatRoomInterface: ChatRoomInterface;
  constructor(chatRoomInterface: ChatRoomInterface) {
    this.chatRoomInterface = chatRoomInterface;
  }

  createChatRoom(chatRoomDetails: ChatRoom): Promise<string> {
    return this.chatRoomInterface.createChatRoom(chatRoomDetails);
  }

   getChatRoomList(): Promise<ChatRoomList> {
    return this.chatRoomInterface.getChatRoomList();
  }
}
