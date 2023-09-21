import { Server, Socket } from "socket.io";
import { CustomSocketAttributes, SocketEventMessage } from "../../../types";

export const roomHandler = (io: Server, socket: Socket) => {
  const sendMessage = (payload: SocketEventMessage) => {
    const currentRoom = (socket as CustomSocketAttributes).room;
    const nickName = (socket as CustomSocketAttributes).token.nickName;
    io.to(currentRoom).emit("message", {
      nickName: nickName,
      messageId: payload.messageId,
      message: payload.message,
    });
  };

  const roomAdded = () => {
    io.emit("roomAdded", "roomAdded");
  };

  socket.on("message", sendMessage);
  socket.on("roomAdded", roomAdded);
};
