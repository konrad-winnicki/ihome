import React, { useState, useEffect } from "react";
//import Navbar from "./components/Navbar";
//import UserDataManipulation from "./components/UserDataManipulation";
//import { PlayerList } from "./components/PlayerList";
//import GetGameData from "./components/GetGameData";
//import GameList from "./components/GameList";
//import RankingList from "./components/RankingList";
// TODO import jwt_decode from "jwt-decode";
// TODO import { JwtPayload } from "jwt-decode";
import { useNavigate } from "react-router-dom";
//import { UserContext } from "./context/UserContext";
import { ChatRoom } from "./ChatRoom";
import ChatListController from "./ChatListController";
import io, { Socket } from "socket.io-client";
import { PORT } from "./config/config";

export interface playerRanking {
  name: string | null;
  successRate: number;
}
export interface IRanking {
  ranking: playerRanking[];
  average: number;
}

interface ChatPanelInterface {
  setIsLoggedIn: (param: boolean) => void;
  isLoggedIn: boolean;
}

export const ChatPanel: React.FC<ChatPanelInterface> = (props) => {
  const [socketConnection, setSocketConnection] = useState<Socket | null>(null);
  const [refreshChatPanel, setRefreshChatPanel] = useState(false);
  const [room, setRoom] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  //const userContext = useContext(UserContext)

  const logout = () => {
    console.log("Logging out...");
    localStorage.clear();
    props.setIsLoggedIn(false);
  socketConnection?.emit("loggedOut")

    //userContext.setIsTokenValid(false)
    navigate("/api/chatroom");
  };

  /* Throttling navigation to prevent the browser from hanging. See https://crbug.com/1038223. Command line switch --disable-ipc-flooding-protection can be used to bypass the protection */

  //one more condition to secure navigation to login if token not valid
  // if (!userContext.isTokenValid) {
  // 	navigate("/")
  // }

  useEffect(() => {
    const socket = (token: string | null) => {
      const URL = `http://localhost:${PORT}`;
      const socket = io(URL, {
        autoConnect: false,
        auth: {
          token: token,
        },
      });
      return socket;
    };

    const socketConnection = socket(token);
    setSocketConnection(socketConnection);
    socketConnection.connect();
    console.log("socket listener setted");
  }, [token]);

  useEffect(() => {
    if (refreshChatPanel) {
      //socketListener?.emit('roomAdded', 'newRoom')
      setRefreshChatPanel(false);
    }
  }, [refreshChatPanel]);

  // const token = localStorage.getItem("token");

  // TODO:
  // if (token) {
  //   const decodedToken: JwtPayload = jwt_decode(token);
  //   const currentDate = new Date();
  //   const tokenExpiration = decodedToken.exp ? decodedToken.exp : null;
  //   if (tokenExpiration) {
  //     if (tokenExpiration * 1000 < currentDate.getTime()) {
  //       console.log("Token expired.");
  //       props.setIsLoggedIn(false)
  //     } else {
  //       console.log("Valid token");
  //     }
  //   }
  // }

  return (
    <div className="h-screen">
      <div className="m-5 border-t-2 border-emerald-950 h-screen">
        {!room ? (
          <ChatListController
            setRefreshChatPanel={setRefreshChatPanel}
            refreshChatPanel={refreshChatPanel}
            socketConnection={socketConnection}
            setRoom={setRoom}
          />
        ) : (
          <ChatRoom
            room={room}
            socketConnection={socketConnection}
            isLoggedIn={props.isLoggedIn}
            setRoom={setRoom}
          />
        )}
      </div>
      <div>
        <button
          onClick={logout}
          className="bg-amber-500 hover:bg-blue-700 text-white text-sm  font-bold py-1 px-1 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
