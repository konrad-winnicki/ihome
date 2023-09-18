import React, { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { v4 } from "uuid";

type Message = {
  nickName: string;
  message: string;
  messageId: string;
};



interface ChatRoomProps {
  isLoggedIn: boolean;
  socketConnection: Socket | null;
  room: string | null;
  setRoom: (param: string | null) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = (props) => {
  const [messageList, setNewMessage] = useState<Array<Message>>([]);
  const [participantList, setNewParticipant] = useState<Array<string>>([]);
  const [formData, setFormData] = useState({
    message: "",
  });

  const token = localStorage.getItem("token");

  let nickName: string;
  const nameFromS = localStorage.getItem("nickName");
  if (nameFromS) {
    nickName = nameFromS;
  } else {
    nickName = "";
  }
  const scrollableContainerRef = useRef(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const messageId = v4();
    props.socketConnection?.emit("messag", {
      messageId: messageId,
      message: formData.message,
    });
    setFormData({ message: "" });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const leaveRoom = () => {
    props.socketConnection?.emit("userLeft");
    props.setRoom(null);
  };

  useEffect(() => {
    if (!props.isLoggedIn) {
      props.socketConnection?.disconnect();
    }

    console.log("partlist", participantList);
  }, [props, participantList, messageList, token]);

  useEffect(() => {
    props.socketConnection?.on("messag", (msg: Message) => {
      setNewMessage([...messageList, msg]);
      console.log('razy')
      console.log("msg", msg);
    });
   
    props.socketConnection?.on("userEntered", (msg: Array<string>) => {
      console.log("userEntered", msg);
      setNewParticipant(msg);
    });
    props.socketConnection?.on("userLeft", (msg: Array<string>) => {
      console.log("userLeft", msg);
      setNewParticipant(msg);
    });
  }, [props.socketConnection, messageList]);

  useEffect(() => {
    props.socketConnection?.emit("userEntered", {
      room: props.room,
    });
  }, [nickName, props.socketConnection, props.room]);

  useEffect(() => {
    console.log("message", messageList);
  }, [messageList]);

  const scrollToBottom = () => {
   // const container = scrollableContainerRef.current as React.MutableRefObject<null>;

    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop =
        scrollableContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);
  return (
    <div className="grid grid-cols-2">
      <div className="border border-2 w-40 border-black mt-1 mr-1 grid-rows-1 grid-flow-row gap-1 overflow-y-auto h-screen ">
      <h2 className="text-2l font-semibold">Users</h2>

        {participantList.length > 0
          ? participantList.map((msg) => {
              return (
                <div
                  // className={`shadow-lg rounded-lg m-2 p-2`}
                  key={msg}
                >
                  <p>
                    <b>{msg}</b>
                  </p>
                </div>
              );
            })
          : ""}
      </div>

      <div className='w-100 border border-2 border-black mt-1 grid-rows-3'>
        <h2 className="text-2l font-semibold">Chat</h2>

        <div
          className="grid-rows-1 grid-flow-row gap-1 max-h-80 overflow-y-auto "
          ref={scrollableContainerRef}
        >
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
    </div>
  );
};
