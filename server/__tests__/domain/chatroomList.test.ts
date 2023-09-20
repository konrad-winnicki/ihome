import { describe, test } from "@jest/globals";
import { ChatRoomList } from "../../src/domain/ChatRoomList";
import { ChatRoom } from "../../src/domain/ChatRoom";

describe("ChatroomList class test", () => {
  function createChatRoomsAndObjects(chatroomNumber: number) {
    const chatRoomClassList = [];
    const objectList = [];
    for (let i = 0; i < chatroomNumber; i++) {
      chatRoomClassList.push(
        new ChatRoom(`id${i}`, `Room${i}`, `ownerId${i}`, new Date())
      );
      objectList.push(
        {id: `id${i}`, chatRoomName: `Room${i}`, chatOwner: `ownerId${i}`}
      );
    }
    return {chatRoomClassList, objectList}
  }


  test("Extract expected details from object properties", () => {
    const {chatRoomClassList, objectList} = createChatRoomsAndObjects(10);
    const chatRoomList = new ChatRoomList(chatRoomClassList);
    expect(chatRoomList.chatRooms).toEqual(objectList);
  });
  
});
