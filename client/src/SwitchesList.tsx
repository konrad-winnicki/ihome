import React, { useState, useEffect } from "react";

import { getSwitches } from "./services";
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
                <div  key={switchDevice.id}>
                <SwitchModule switchDevice={switchDevice}></SwitchModule>
</div>
              );
            })}
        
      </div>
    </div>
  );
};

export default SwitchesList;
