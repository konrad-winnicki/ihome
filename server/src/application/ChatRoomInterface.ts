import { ChatRoom } from "../domain/ChatRoom";
import { ChatRoomList } from "../domain/ChatRoomList";

export interface ChatRoomInterface {
  createChatRoom(chatRoomDetails: ChatRoom): Promise<string>;
 // changeName(playerId: string, newName: string): Promise<Partial<Player>>;
  //findChatByName(chatName: string): Promise<ChatRoom>;
 // findUserByEmail(userEmail: string): Promise<User>;
  getChatRoomList(): Promise<ChatRoomList>;
}
