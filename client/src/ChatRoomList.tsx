import React, { useEffect, useState, useCallback } from "react";
import { fetchChatRoomList } from "./services";

export interface ChatRoomInterface {
  id: string;
  chatRoomName: string;
  chatOwner: string;
}

interface ChatRoomProps {
  setRoom: (param: string) => void;
  actualiseRoomList: boolean;
  setActualiseRoomList: (parat: boolean) => void;

}

export const ChatRoomList: React.FC<ChatRoomProps> = (props) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [fetchData, setFetchData] = useState(true);

  const getChatRoomList = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetchChatRoomList(token);

      if (response.ok) {
        const responseData = await response.json();
        setChatRooms(responseData.chatRoomList);
      } else {
        console.error("fetching games");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [props]);

  

  useEffect(() => {
    if (props.actualiseRoomList) {
      console.log('actualize activated')
      setFetchData(true);
      props.setActualiseRoomList(false)
    }

    if (fetchData) {
      setFetchData(false);
      getChatRoomList();
    }
    // getChatRoomList();
  }, [props, chatRooms, props.actualiseRoomList]);
  /*
  useEffect(() => {
    console.log('List content changed:', chatRooms);
  }, [chatRooms])
*/
  const handleButtonClick = (chatRoomId: string) => {
    props.setRoom(chatRoomId);
  };

  return (
    <div className=" w-full p-6 bg-white rounded-lg shadow-lg">
      {chatRooms ? (
        <div>
          <div className="text-lg text-black-500 font-bold">
            Avaliable rooms:
          </div>
          {chatRooms.map((chatRoom: ChatRoomInterface) => {
            return (
              <div key={chatRoom.id}>
                <p>
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-lg text-white py-1 px-2 rounded-md my-1 shadow-md"
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
      ) : (
        ""
      )}
    </div>
  );
};
