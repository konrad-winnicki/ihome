import { useEffect, useState } from "react";
import CreateMeter from "./CreateMeter";
import Login from "./Login";
import Temperature from "./Temperature";
import ToogleSwitch from "./ToogleSwitch";
import MetersList from "./MetersList";
import CreateSwitch from "./CreateSwitch";
import SwitchesList from "./SwitchesList";
import { Time } from "./time";
import { GiClockwork } from "react-icons/gi";
import { InstallButton } from "./InstallButton";
import { RadioExample } from "./radio";

const App: React.FC = () => {
  const [installMeter, setInstallMeter] = useState(false);
  const [installSwitch, setInstallSwitch] = useState(false);

  useEffect(() => {}, [installMeter]);

  return (
    <div className="App">
      <div className="max-h-100 items-center justify-center bg-color-movement ">
        <div className="app-container p-6 bg-white rounded-lg shadow-lg m-8">
          <MetersList></MetersList>
          <SwitchesList></SwitchesList>
          <div className="flex flex-row m-2">
            <InstallButton
              name={"Meter"}
              componentToRender={CreateMeter}
            ></InstallButton>

            <InstallButton
              name={"Switch"}
              componentToRender={CreateSwitch}
            ></InstallButton>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default App;
