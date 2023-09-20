import { ChatRoom } from "./ChatRoom";

export type ChatRoomDetailsType = {
  id: string;
  chatRoomName: string | null;
  chatOwner: string;
};

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
