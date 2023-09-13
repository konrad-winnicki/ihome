import React, { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { v4 } from "uuid";
import { PORT } from "./config/config";

type Message = {
  nickName: string;
  message: string;
  messageId: string;
};

type Participant = {
  nickName: string;
  socketId: string;
  room:string,
  reason?: string;
};

interface ChatRoomInterface {
  isLoggedIn: boolean
  setRoomChoosen: (param: boolean) => void;

}

export const ChatRoom: React.FC<ChatRoomInterface> = (props) => {
  const [socketListener, setSocketListener] = useState<Socket | null>(null);
 // const [isMessageSent, setMessageSent]= useState(false)
  const token = localStorage.getItem("token");
  const nickName = localStorage.getItem("nickName");
const room = localStorage.getItem('room')

const scrollableContainerRef = useRef(null)

  const [formData, setFormData] = useState({
    message: "",
  });

  const [messageList, setNewMessage] = useState<Array<Message>>([]);
  const [participantList, setNewParticipant] = useState<Array<Participant>>([]);
    console.log('room', localStorage.getItem('room'))

  const socket = (token: string | null) => {
    const URL = `http://localhost:${PORT}`;
    const socket = io(URL, {
      autoConnect: false,
      auth: {
        room:room,
        token: token,
      },
    });
    return socket;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  socketListener?.on("messag", (msg: Message) => {
    setNewMessage([...messageList, msg]);
    //console.log('msg', msg)
  });

  socketListener?.on(
    "connected",
    //console.log('room', localStorage.getItem('room'))
    (participant: { socketId: string; nickName: string, room:string }) => {
      setNewParticipant([...participantList, participant]);
      console.log("connected with datos", participant);
    }
  );

  socketListener?.on(
    "disconnected",
    (participant: { socketId: string; nickName: string, room:string }) => {
      deleteParticipant(participant);
      console.log("disconnected", participant);
    }
  );

  const deleteParticipant = (toDelete: Participant) => {
    console.log(toDelete.socketId);
    const newParticipantList = participantList.filter(
      (participant) => participant.socketId != toDelete.socketId
    );
    setNewParticipant(newParticipantList);
    console.log(newParticipantList);
  };

  const leaveRoom = ()=>{
    socketListener?.disconnect();
    props.setRoomChoosen(false)

}
  useEffect(() => {
    console.log('room', localStorage.getItem('room'))
    console.log("list", participantList);

    if (!socketListener) {
      const socketListener = socket(token);
      setSocketListener(socketListener);
      socketListener.connect();
      console.log("socket listener setted");
    }

    if(!props.isLoggedIn){
      socketListener?.disconnect();

    }

    console.log("partlist", participantList);
  }, [props, participantList, socketListener, messageList, token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // const socketEmitter = socket(token);
    //socketEmitter?.connect();
   // setMessageSent(true)
    const messageId = v4();
    socketListener?.emit("messag", {
      nickName: nickName,
      messageId: messageId,
      message: formData.message,
      room: room
    });
    setFormData({ message: "" });
  };


  const scrollToBottom = () => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
    }
  };

  useEffect(()=>{
    scrollToBottom()
  }, [messageList])
  return (
    <div className="flex-col">
      <h2 className="text-2l font-semibold mb-4">Chat</h2>

      <div className="grid-rows-1 grid-flow-row gap-1 max-h-80 overflow-y-auto " ref={scrollableContainerRef}>
        {messageList.map((msg) => {
          return (
            <div
              className={`shadow-lg rounded-lg m-2 p-2 ${
                nickName === msg.nickName ? "bg-green-200" : " bg-blue-200"
              }`}
              key={msg.messageId}
            >
              <p>
                <b>{msg.nickName}:</b> {msg.message}
              </p>
            </div>
          );
        })}
      </div>

      <form>
      <div className="grid-cols-2">
        <div className="mb-4 inline-block">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            message
          </label>
          <input
            className="p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
          />
        </div>
        <button
          className="mt-2 bg-blue-500 text-white text-lg py-1 px-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          onClick={handleSubmit}
        >
          SEND
        </button>
        </div>
      </form>
      <div>
        <button
          onClick={leaveRoom}
          className="bg-amber-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-1 rounded"
        >
          Leave room
        </button>
      </div>
    </div>
  );
};
