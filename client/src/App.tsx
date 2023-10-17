import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import { InstallButton } from "./InstallButton";
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
              <InstallButton
                name={"IP"}
                componentToRender={SetIP}
                setInstall={setInstall}
                install={install}
              ></InstallButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
