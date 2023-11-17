import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import { SettingsButton } from "./SettingsButton";
import SetIP from "./SetIP";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [install, setInstall] = useState<string | null>(null);

  return (
    <div className="h-screen items-center justify-center bg-color-movement">
      <div className="h-screen bg-white rounded-lg m-2">
        {isLoggedIn ? (
          <Dashboard />
        ) : (
          <div>
            {!install ? <Login setIsLoggedIn={setIsLoggedIn} /> : ""}
            <div className="text-left">
              <SettingsButton
                name={"IP"}
                componentToRender={SetIP}
                setAddSettings={setInstall}
                settings={install}
              ></SettingsButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
