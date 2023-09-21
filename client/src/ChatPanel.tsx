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

  const logout = () => {
    socketConnection?.emit("loggedOut");
    console.log("Logging out...");
    localStorage.clear();
    props.setIsLoggedIn(false);
    navigate("/api/login");
  };

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
  }, [token]);

  useEffect(() => {
    console.log('is loged in in chat panel', props.isLoggedIn)
    if (refreshChatPanel) {
      setRefreshChatPanel(false);
    }

    if (!props.isLoggedIn){
      console.log('chaatroom disconnect')
      socketConnection?.emit("disconnect");

    }
  }, [refreshChatPanel, props, socketConnection]);

  return (
    <div className="h-screen">
      <div className="flex items-center mt-4 justify-center overflow-y-auto max-h-100">
        {!room ? (
          <ChatListController
            setRefreshChatPanel={setRefreshChatPanel}
            refreshChatPanel={refreshChatPanel}
            socketConnection={socketConnection}
            setIsLoggedIn={props.setIsLoggedIn}
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
