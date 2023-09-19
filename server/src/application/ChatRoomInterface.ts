import { ChatRoom } from "../domain/ChatRoom";
import { ChatRoomList } from "../domain/ChatRoomList";

export interface ChatRoomInterface {
  createChatRoom(chatRoomDetails: ChatRoom): Promise<string>;
  getChatRoomList(): Promise<ChatRoomList>;
}
