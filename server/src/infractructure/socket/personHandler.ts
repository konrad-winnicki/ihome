import { Server, Socket } from "socket.io";
import { CustomSocketAttributes } from "../../../types";
import { roomsOccupancy } from "../../Server";

export const personHandler = (io: Server, socket: Socket) => {
  const addPersonToRoomAndEmitEvent = (payload: { room: string }) => {
    if (payload.room) {
      (socket as CustomSocketAttributes).room = payload.room;
    } else {
      throw new Error("Person entered but room not passed from emiter");
    }

    const nickName = (socket as CustomSocketAttributes).token.nickName;
    const currentRoom = payload.room;

    socket.join(currentRoom);
    roomsOccupancy.addPersonToRoom(currentRoom, nickName);
    io.to(currentRoom).emit(
      "userEntered",
      roomsOccupancy.roomToPerson.get(currentRoom)
    );
  };

  const deletePersonFromRoomAndEmitEvent = (payload?: string) => {
    const currentRoom = (socket as CustomSocketAttributes).room;
    const nickName = (socket as CustomSocketAttributes).token.nickName;
    socket.leave(currentRoom);
    roomsOccupancy.deletePersonFromRoom(currentRoom, nickName);
    io.emit("userLeft", roomsOccupancy.roomToPerson.get(currentRoom));
    payload
      ? console.log(`🔥: ${nickName} disconnected`, payload)
      : console.log(`🔥: ${nickName} left`);
  };

  socket.on("userEntered", addPersonToRoomAndEmitEvent);
  socket.on("userLeft", deletePersonFromRoomAndEmitEvent);
  socket.on("loggedOut", deletePersonFromRoomAndEmitEvent);
  socket.on("disconnect", deletePersonFromRoomAndEmitEvent);
};
