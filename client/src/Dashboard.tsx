import { useState } from "react";
import CreateSensor from "./CreateSensor";
import CreateSwitch from "./CreateSwitch";
import SwitchesList from "./SwitchList";
import { SettingsButton } from "./SettingsButton";
import SetIP from "./SetIP";
import SensorList from "./SensorList";

const Dashboard: React.FC = () => {
  const [settings, setAddSettings] = useState<string | null>(null);



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
          settings === "Sensors" ||
          settings === "IP" ||
          settings === "Switches"
            ? "w-full"
            : "h-1/3 grid grid-cols-4 gap-1"
        }`}
      >
        <div className="col-span-1">
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
        </div>
        <div className="col-span-1">
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
        <div className="col-span-1">
          {!settings || settings === "IP" ? (
            <SettingsButton
              name={"IP"}
              componentToRender={SetIP}
              setAddSettings={setAddSettings}
              settings={settings}
            ></SettingsButton>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
