"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var ChatRoomList_1 = require("../../src/domain/ChatRoomList");
var ChatRoom_1 = require("../../src/domain/ChatRoom");
(0, globals_1.describe)("ChatroomList class test", function () {
    function createChatRoomsAndObjects(chatroomNumber) {
        var chatRoomClassList = [];
        var objectList = [];
        for (var i = 0; i < chatroomNumber; i++) {
            chatRoomClassList.push(new ChatRoom_1.ChatRoom("id".concat(i), "Room".concat(i), "ownerId".concat(i), new Date()));
            objectList.push({ id: "id".concat(i), chatRoomName: "Room".concat(i), chatOwner: "ownerId".concat(i) });
        }
        return { chatRoomClassList: chatRoomClassList, objectList: objectList };
    }
    (0, globals_1.test)("Extract expected details from object properties", function () {
        var _a = createChatRoomsAndObjects(10), chatRoomClassList = _a.chatRoomClassList, objectList = _a.objectList;
        var chatRoomList = new ChatRoomList_1.ChatRoomList(chatRoomClassList);
        (0, globals_1.expect)(chatRoomList.chatRooms).toEqual(objectList);
    });
});
