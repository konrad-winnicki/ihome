import { useEffect, useState } from "react";
import Login from "./Login";
import ChatPanel from "./ChatPanel";

type AppProps = {
  isLoggedIn:boolean
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  
  return (
    <div className="App">
      <div className="max-h-100 items-center justify-center bg-color-movement ">
        <div className="app-container p-6 bg-white rounded-lg shadow-lg m-8">
          {isLoggedIn ? <ChatPanel isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> : <Login setIsLoggedIn={setIsLoggedIn} />}
        </div>
      </div>
    </div>
  );
}

export default App;
