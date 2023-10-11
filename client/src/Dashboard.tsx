import { useState } from "react";
import CreateMeter from "./CreateMeter";
import MetersList from "./MetersList";
import CreateSwitch from "./CreateSwitch";
import SwitchesList from "./SwitchesList";
import { InstallButton } from "./InstallButton";
import SetIP from "./SetIP";

const Dashboard: React.FC = () => {
  const [install, setInstall] = useState<string | null>(null);

  return (
    <div className="h-screen app-container bg-white rounded-lg m-2">
      <div className="max-h-1/2 mb-2 overflow-y-auto"> {!install ? <MetersList></MetersList> : ""}</div>
      <div className="max-h-1/2 mb-2 overflow-y-auto"> {!install ? <SwitchesList></SwitchesList> : ""}</div>
      <div className="h-1/3 flex flex-row">
        {!install || install === "Meter" ? (
          <InstallButton
            name={"Meter"}
            componentToRender={CreateMeter}
            setInstall={setInstall}
            install={install}
          ></InstallButton>
        ) : (
          ""
        )}
        {!install || install === "Switch" ? (
          <InstallButton
            name={"Switch"}
            componentToRender={CreateSwitch}
            setInstall={setInstall}
            install={install}
          ></InstallButton>
        ) : (
          ""
        )}
        {!install || install === "IP" ? (
          <InstallButton
            name={"IP"}
            componentToRender={SetIP}
            setInstall={setInstall}
            install={install}
          ></InstallButton>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Dashboard;
