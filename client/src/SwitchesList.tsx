import React, { useState, useEffect } from "react";
import { FaTrashRestoreAlt } from "react-icons/fa";

import { getMeasurement, getMeters, getSwitches } from "./services";
import ToggleSwitch from "./ToogleSwitch";
import SwitchModule from "./SwitchModule";

export interface Parameters {
  [key: string]: string;
}

export interface SwitchInterface {
  id: string;
  name: string;
  onStatus:boolean;
}



const SwitchesList: React.FC = () => {
  const [switches, setSwitches] = useState<SwitchInterface[]>([]);
  const [actualMeterId, setActualMeterId] = useState<string | null>(null);

  async function getSwitchList() {
    const response = await getSwitches();
    if (response.ok) {
      const data = await response.json();
      setSwitches(data);
    }
  }

  

  
  useEffect(() => {
    getSwitchList();
  }, []);

 

  return (
    <div className="chatList flex items-center justify-center border-5 border-sky-500 m-4 p- flex flex-col rounded-lg">
    <h1 className="w-full bg-violet-700 p-0 text-white rounded-xl text-2l font-semibold m-0">Switches</h1>

      <div className="gap-2">
            {switches.map((switchDevice: SwitchInterface) => {
              return (
                <SwitchModule switchDevice={switchDevice}></SwitchModule>

              );
            })}
        
      </div>
    </div>
  );
};

export default SwitchesList;
