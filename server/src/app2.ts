import cors from "cors";
import express from "express";
import {createServer} from "http";
import { Server } from "socket.io";




const app = express();
app.use(cors());

const soc = ()=>{
  const httpServer = createServer(app);
//app.get("/", function (req, res) {
 // res.status(200).send("Ala ma kota");
//});
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});


io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("messag", (msg) => {
    //messages.push(msg);
    console.log(msg);
    socket.broadcast.emit("messag", msg);
  });
  socket.on("disconnect", () => {
    console.log(`🔥: ${socket.id} user disconnected`);
  });
});

httpServer.listen(8002, () => {
  console.log("server listen at 8002");
});

}
soc()