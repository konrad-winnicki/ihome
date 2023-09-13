import React, { useState, useEffect } from "react";
//import PlayGame from "./PlayGame";
//import DeleteGames from "./DeleteGames";
import CreateChatRoom from "./CreateChatRoom";
import { ChatRoomList } from "./ChatRoomList";

type ChatListControllerProps = {
  setRefreshChatPanel: (param: boolean) => void;
  setRoomChoosen: (param: boolean) => void;

  refreshChatPanel: boolean;
};

const ChatListController: React.FC<ChatListControllerProps> = (props) => {
  const [isCreateChatRoomInProgress, setCreateChatRoomInProgress] = useState(false);
  //const [isGameInProgress, setGameInProgress] = useState(false);
  //const [gamesDeleted, setGamesDeleted] = useState(false);

  useEffect(() => {
    console.log('chatListcontroller', isCreateChatRoomInProgress)
    

  }, [isCreateChatRoomInProgress]);

  return (
    // TODO changeName a overlay div
    <div className="chatList w-60  border-5 border-sky-500 m-4 p- flex flex-col rounded-lg">
      
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white text-lg font-bold py-2 px-2 rounded"
        onClick={() => {
          setCreateChatRoomInProgress(true);
        }}
      >
        Create you room
      </button>
      {isCreateChatRoomInProgress ? (
        <CreateChatRoom
        setCreateChatRoomInProgress={setCreateChatRoomInProgress}
        setRefreshChatPanel={props.setRefreshChatPanel}
        />
      ) : (
        ""
      )}
      
      <ChatRoomList setRoomChoosen={props.setRoomChoosen}setRefreshChatPanel={props.setRefreshChatPanel} setCreateChatRoomInProgress={setCreateChatRoomInProgress} isCreateChatRoomInProgress={isCreateChatRoomInProgress}
/>

     
    </div>
  );
};

export default ChatListController;
