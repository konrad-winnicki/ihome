import React, { useState, useEffect } from "react";
//import PlayGame from "./PlayGame";
//import DeleteGames from "./DeleteGames";
import CreateChatRoom from "./CreateChatRoom";
import { ChatRoomList } from "./ChatRoomList";
import { Socket } from "socket.io-client";

type ChatListControllerProps = {
  setRefreshChatPanel: (param: boolean) => void;
  socketConnection: Socket | null;
  setRoom: (param: string) => void;

  refreshChatPanel: boolean;
};

const ChatListController: React.FC<ChatListControllerProps> = (props) => {
  const [isCreateChatRoomInProgress, setCreateChatRoomInProgress] =
    useState(false);
  const [isNewRoom, setNewRoom] = useState(false);
  const [actualiseRoomList, setActualiseRoomList] = useState(false);

  useEffect(() => {
    props.socketConnection?.on("roomAdded", () => {
      console.log("ala");
      setActualiseRoomList(true);
    });
  }, [props.socketConnection]);

  useEffect(() => {
    console.log("chatListcontroller", isCreateChatRoomInProgress);
    console.log("list controller", isNewRoom);
    if (isNewRoom) {
      props.socketConnection?.emit("roomAdded", "newRoom");
      setNewRoom(false);
    }
  }, [isCreateChatRoomInProgress, isNewRoom, actualiseRoomList]);

  return (
    // TODO changeName a overlay div
    <div className="chatList flex items-center justify-center border-5 border-sky-500 m-4 p- flex flex-col rounded-lg">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white text-lg font-bold py-2 px-2 rounded"
        onClick={() => {
          setCreateChatRoomInProgress(true);
        }}
      >
        Create your room
      </button>
      {isCreateChatRoomInProgress ? (
        <CreateChatRoom
          setCreateChatRoomInProgress={setCreateChatRoomInProgress}
          setRefreshChatPanel={props.setRefreshChatPanel}
          setNewRoom={setNewRoom}
        />
      ) : (
        ""
      )}

      <ChatRoomList
        setRoom={props.setRoom}
        setActualiseRoomList={setActualiseRoomList}
        actualiseRoomList={actualiseRoomList}
      />
    </div>
  );
};

export default ChatListController;
