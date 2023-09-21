import { useEffect, useState } from "react";
import Login from "./Login";
import ChatPanel from "./ChatPanel";
import { useLocation } from "react-router-dom";
import jwt_decode from "jwt-decode";

interface DecodedToken {
  userId: string;
  nickName: string;
}
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();

  const getCookie = (cookieName: string) => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${cookieName}=`)) {
        return cookie.substring(cookieName.length + 1);
      }
    }
    return null;
  };

  useEffect(() => {
    
    const token = getCookie("token");
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    if (token) {
      const decodedToken: DecodedToken = jwt_decode(token);
      localStorage.setItem("token", token);
      localStorage.setItem("nickName", decodedToken.nickName);
      localStorage.setItem("id", decodedToken.userId);
      setIsLoggedIn(true);
    }else{
      setIsLoggedIn(location.state);

    }


  }, [location.state]);

  return (
    <div className="App">
      <div className="max-h-100 items-center justify-center bg-color-movement ">
        <div className="app-container p-6 bg-white rounded-lg shadow-lg m-8">
          {isLoggedIn ? (
            <ChatPanel isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          ) : (
            <Login />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
