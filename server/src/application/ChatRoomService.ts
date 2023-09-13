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

  //changeName(playerId: string, newName: string): Promise<Partial<Player>> {
  //   return this.playerInterface.changeName(playerId, newName);
  // }

  //findUser(userId: string): Promise<User> {
  //  return this.userInterface.findUser(userId);
  //}

  //findUserByEmail(userEmail: string): Promise<User> {
  // return this.userInterface.findUserByEmail(userEmail);
  //}

   getChatRoomList(): Promise<ChatRoomList> {
    return this.chatRoomInterface.getChatRoomList();
  }
}
