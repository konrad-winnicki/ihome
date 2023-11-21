import { useContext, useState } from "react";
import CreateSensor from "./sensorComponents/CreateSensor";
import SwitchesList from "./switchComponents/SwitchList";

import SensorList from "./sensorComponents/SensorList";
import { CreateSwitch } from "./switchComponents/CreateSwitch";
import { AuthorizationContext } from "./contexts/AuthorizationContext";
import { SettingsButton } from "./SettingsButton";

const Dashboard: React.FC = () => {
  const [settings, setAddSettings] = useState<string | null>(null);
  const authorizationContext = useContext(AuthorizationContext);

  return (
    <div className="h-screen app-container bg-white rounded-lg m-2">
      <div className="max-h-1/2 mb-2 overflow-y-auto">
        {" "}
        {!settings ? <SensorList></SensorList> : ""}
      </div>
      <div className="max-h-1/2 mb-2 overflow-y-auto">
        {" "}
        {!settings ? <SwitchesList></SwitchesList> : ""}
      </div>
      <div
        className={`flex ${
          settings === "Sensors" || settings === "Switches"
            ? "w-full"
            : "grid grid-cols-3 gap-1"
        }`}
      >
        <div className="col-span-1 ml-2">
          {!settings || settings === "Sensors" ? (
            <SettingsButton
              name={"Sensors"}
              componentToRender={CreateSensor}
              setAddSettings={setAddSettings}
              settings={settings}
            ></SettingsButton>
          ) : (
            ""
          )}

          {!settings || settings === "Switches" ? (
            <SettingsButton
              name={"Switches"}
              componentToRender={CreateSwitch}
              setAddSettings={setAddSettings}
              settings={settings}
            ></SettingsButton>
          ) : (
            ""
          )}
        </div>
        <div className="col-span-1 ml-2"></div>

        <div className="col-span-1 ml-2">
          {!settings ? (
            <button
              className="m-1 bg-blue-700 hover:bg-green-700 text-white text-sm font-bold py-2 px-2 rounded"
              onClick={() => {
                authorizationContext.setLoggedIn(false);
              }}
            >
              <div className="flex justify-center items-center">
                <div className=" m-1">Log out</div>
              </div>
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
