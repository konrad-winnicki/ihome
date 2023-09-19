import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import sanitizedConfig from "../config/config";
import * as httpLibrary from "http";
import { RoomOccupancyMapManager } from "./RoomOccupancyMapManager";

interface CustomSocket extends Socket {
    token: JwtPayload; 
  }

export async function socketSetup (httpServer:httpLibrary.Server) {
    const roomsMap = new Map<string, Array<string>>();
    const roomsOccupancyMap = new RoomOccupancyMapManager(roomsMap);
    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
      },
    });
  
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      console.log("handshake");
      try {
        const decodedToken = jwt.verify(token, sanitizedConfig.JWT_SECRET, {
          ignoreExpiration: false,
        }) as JwtPayload;
  
        (socket as CustomSocket).token = decodedToken;
        next();
      } catch (error) {
        if (error === "jwt expired") {
          console.log("jwt expired");
          //next(error)
        }
        console.log("no token or bad token");
        //next(error);
      }
    });
  
    io.on("connection", (socket) => {
      const nickName = (socket as CustomSocket).token.nickName;
      let room: string | null = null;
      console.log(`⚡: ${nickName} just connected!`);
      io.emit("connected", { socketId: socket.id, nickName: nickName });
      socket.on("messag", (msg) => {
        console.log(msg);
        if (room) {
          io.to(room).emit("messag", {
            nickName: nickName,
            messageId: msg.messageId,
            message: msg.message,
          });
        }
      });
  
      socket.on("roomAdded", (msg) => {
        console.log(msg);
        io.emit("roomAdded", "roomAdded");
      });
  
      socket.on("userEntered", (msg) => {
        room = msg.room;
        if (room) {
          socket.join(msg.room);
          roomsOccupancyMap.addItemToMap(room, nickName);
          io.to(room).emit("userEntered", roomsOccupancyMap.map.get(room));
          console.log(roomsOccupancyMap.map);
        }
      });
  
      socket.on("userLeft", () => {
        if (room) {
          socket.leave(room);
          roomsOccupancyMap.deleteItemFromMap(room, nickName);
          io.emit("userLeft", roomsOccupancyMap.map.get(room));
        }
      });
  
      socket.on("loggedOut", () => {
        if (room) {
          socket.leave(room);
          roomsOccupancyMap.deleteItemFromMap(room, nickName);
          io.emit("userLeft", roomsOccupancyMap.map.get(room));
        }
      });
  
      socket.on("disconnect", (reason) => {
        console.log("rroom", room);
        if (room) {
          roomsOccupancyMap.deleteItemFromMap(room, nickName);
          io.emit("userLeft", roomsOccupancyMap.map.get(room));
        }
        console.log(`🔥: ${nickName} disconnected`, reason);
      });
    });
  }