import React, { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import {v4} from 'uuid'
type Message = {
  nickName: string; message: string;
  messageId:string
}

type Participant = {
  nickName: string; socketId: string;
  reason?:string

}

export const ChatRoom: React.FC = () => {
  const [socketListener, setSocketListener] = useState<Socket | null>(null);
  const token = localStorage.getItem("token");
  const nickName = localStorage.getItem('nickName');

  const [formData, setFormData] = useState({
    message: "",
  });

  const [messageList, setNewMessage] = useState<Array<Message>>([]);
  const [participantList, setNewParticipant] = useState<Array<Participant>>([]);


  const socket = (token: string | null) => {
    const URL = "http://localhost:8004";
    const socket = io(URL, {
      autoConnect: false,
      auth: {
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
  socketListener?.on("messag", (msg:Message) => {
    setNewMessage([...messageList, msg]);
    //console.log('msg', msg)
  });

  socketListener?.on("connected", (participant:{socketId:string, nickName:string}) => {
    setNewParticipant([...participantList, participant])
    console.log('connected', participant)

  });

  socketListener?.on("disconnected", (participant:{socketId:string, nickName:string}) => {
    deleteParticipant(participant)
    console.log('disconnected', participant)
  });


const deleteParticipant = (toDelete:Participant)=>{
  console.log(toDelete.socketId)
  const newParticipantList = participantList.filter((participant)=> participant.socketId !=  toDelete.socketId)
  setNewParticipant(newParticipantList)
  console.log(newParticipantList)
}

  useEffect(() => {
    if (!socketListener) {
      const socketListener = socket(token);
      setSocketListener(socketListener);
      socketListener.connect();
      console.log("socket listener setted");
    }
    console.log('partlist',participantList)

  }, [participantList, socketListener, messageList, token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
   // const socketEmitter = socket(token);
    //socketEmitter?.connect();
    const messageId = v4()
    socketListener?.emit("messag", {nickName: nickName, messageId: messageId, message: formData.message});
    setFormData({message: ""})

  };
  return (
    <>
          <h2 className="text-2xl font-semibold mb-4">Chat</h2>

      <div className="m-5  border-t-4 border-double border-emerald-950 flex-col inline-block max-h-360 overflow-y-auto ">

          {messageList.map((msg) => {
            
            return (
              <div className={`shadow-lg  rounded-lg m-4 p-4 max-h-96 ${nickName===msg.nickName?"bg-green-200":"bg-blue-200"}`} key={msg.messageId}>

                
                  <p><b>{msg.nickName}:</b> {msg.message}</p>
               
              </div>
            );
          })}
        
      </div>

      <form>
        <div className="mb-4 inline-block" >
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            message
          </label>
          <input
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
          />
        </div>
        <button
          className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          onClick={handleSubmit}
        >
          SEND
        </button>
      </form>
    </>
  );
};
