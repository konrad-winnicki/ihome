import { createContext, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import { SettingsButton } from "./SettingsButton";
import SetIP from "./SetIP";

export type AuthContextValue = {
  isLoggedIn: boolean;
  setIsLoggedIn: (newParam: boolean) => void;
};

export const AuthorizationContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [install, setInstall] = useState<string | null>(null);

  return (
    <div className="h-screen items-center justify-center bg-color-movement">
      <div className="h-screen bg-white rounded-lg m-2">
        <AuthorizationContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
          {isLoggedIn ? (
            <Dashboard />
          ) : (
            <div>
              {!install ? <Login /> : ""}
              <div
                className={`flex ${
                  install ? "w-full" : "grid grid-cols-3 gap-1"
                }`}
              >
                <div className="w-full">
                  <SettingsButton
                    name={"IP"}
                    componentToRender={SetIP}
                    setAddSettings={setInstall}
                    settings={install}
                  ></SettingsButton>
                </div>
              </div>
            </div>
          )}
        </AuthorizationContext.Provider>
      </div>
    </div>
  );
}

export default App;
