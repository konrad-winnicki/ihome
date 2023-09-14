import React, { useEffect, useState, useCallback } from "react";
import { fetchChatRoomList } from "./services";
import { ChatRoom } from "./ChatRoom";

export interface ChatRoomInterface {
  id: string;
  chatRoomName: string;
  chatOwner: string;
}

interface ChatRoomProps {
  setRefreshChatPanel: (parat: boolean) => void;
  setRoomChoosen: (parat: boolean) => void;
isNewRoom: boolean
  isCreateChatRoomInProgress:boolean
  setCreateChatRoomInProgress: (parat: boolean) => void;
  setRoom:(param:string)=>void;


}

export const ChatRoomList: React.FC<ChatRoomProps> = (props) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [fetchData, setFetchData] = useState(true)
  //const [roomChoosen, setRoomChoosen] = useState(false);

  const getChatRoomList = useCallback(async () => {
    console.log("GGGGGGG");
    try {
      const token = localStorage.getItem("token");
      const response = await fetchChatRoomList(token);

      if (response.ok) {
        const responseData = await response.json();
        setChatRooms(responseData.chatRoomList);
        console.log("rooms:", chatRooms);
      } else {
        console.error("fetching games");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
    props.setRefreshChatPanel(true);
    //props.setCreateChatRoomInProgress(false);

  },[chatRooms, props]);


  

  useEffect(() => {
    console.log("new rooms:", chatRooms);
    console.log('newRoom Ok', props.isNewRoom)
if(props.isCreateChatRoomInProgress){
    setFetchData(true);}

if (props.isNewRoom){
  setFetchData(true)
}
if (fetchData){
  setFetchData(false)

  getChatRoomList()
}
   // getChatRoomList();
  }, [props, chatRooms]);
/*
  useEffect(() => {
    console.log('List content changed:', chatRooms);
  }, [chatRooms])
*/
  const handleButtonClick = (chatRoomId: string) => {
    props.setRoomChoosen(true)
    //localStorage.setItem('room', chatRoomId)
    props.setRoom(chatRoomId)
    console.log(chatRoomId);
  };

  return (
    <div className=" w-full p-6 bg-white rounded-lg shadow-lg">
      {chatRooms ? (
        <div>
          <div className="text-lg text-black-500 font-bold">Avaliable rooms:</div>
          {chatRooms.map((chatRoom: ChatRoomInterface) => {
            return (
              <div key={chatRoom.id}>
                <p>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-lg text-white py-1 px-2 rounded-md my-1 shadow-md"
                    onClick={() => handleButtonClick(chatRoom.id)}
                    id={chatRoom.id}
                  >
                    {chatRoom.chatRoomName}
                  </button>
                </p>
              </div>
            );
          })}
        </div>
      ) : ""}
    </div>
  );
};
