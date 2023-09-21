import { ChatRoomDetailsType } from "../../types";
import { ChatRoom } from "./ChatRoom";

export class ChatRoomList {
  readonly chatRooms: Array<ChatRoomDetailsType>;
  constructor(chatRooms: Array<ChatRoom>) {
    this.chatRooms = this.prepareChatRoomDetails(chatRooms);
  }

  private prepareChatRoomDetails(
    chatRooms: Array<ChatRoom>
  ): Array<ChatRoomDetailsType> {
    return chatRooms.map((chatRoom) => {
      return {
        id: chatRoom.id,
        chatRoomName: chatRoom.name,
        chatOwner: chatRoom.ownerId,
      };
    });
  }
}
