import { useState } from "react";
import Login from "./Login";
import SetIP from "./ipComponents/SetIP";
import { SettingsButton } from "./SettingsButton";

function StartPage() {
  const [install, setInstall] = useState<string | null>(null);

  return (
    <div className="h-screen items-center justify-center bg-color-movement">
      <div className="h-screen bg-white rounded-lg m-2">
        <div>
          {!install ? <Login /> : ""}
          <div
            className={`flex ${install ? "w-full" : "grid grid-cols-3 gap-1"}`}
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
      </div>
    </div>
  );
}

export default StartPage;
