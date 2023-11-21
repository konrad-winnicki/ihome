import { useState } from "react";
import Dashboard from "./Dashboard";
import StartPage from "./StartPage";
import { AuthorizationContext } from "./contexts/AuthorizationContext";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <div className="h-screen items-center justify-center bg-color-movement">
      <div className="h-screen bg-white rounded-lg m-2">
        <AuthorizationContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
          {isLoggedIn ? <Dashboard /> : <StartPage></StartPage>}
        </AuthorizationContext.Provider>
      </div>
    </div>
  );
}

export default App;
