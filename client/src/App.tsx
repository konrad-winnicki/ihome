import {useState } from "react";
import CreateMeter from "./CreateMeter";
import MetersList from "./MetersList";
import CreateSwitch from "./CreateSwitch";
import SwitchesList from "./SwitchesList";
import { InstallButton } from "./InstallButton";
import SetIP from "./SetIP";

const App: React.FC = () => {
  const [install, setInstall] = useState<string | null>(null);

  // useEffect(() => {}, [installMeter]);

  return (
    <div className="App">
      <div className="max-h-100 items-center justify-center bg-color-movement ">
        <div className="app-container bg-white rounded-lg m-2">
          {!install ? <MetersList></MetersList> : ""}
          {!install ? <SwitchesList></SwitchesList> : ""}
          <div className="flex flex-row">
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
      </div>
    </div>
  );
};

export default App;
