import React, { useState, useEffect } from "react";
import { RxDropdownMenu} from "react-icons/rx"
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
  const [showSwitches, setShowSwitches] = useState<boolean>(false);

  async function getSwitchList() {
    const response = await getSwitches();
    if (response.ok) {
      const data = await response.json();
      setSwitches(data);
    }
  }

  
  useEffect(() => {
    if (showSwitches){getSwitchList()}

  }, [showSwitches]);

 

  return (
    <div className="SwitchList flex items-center justify-center border-5 border-sky-500 flex flex-col">
    
    <button onClick={()=> showSwitches? setShowSwitches(false): setShowSwitches(true)} className="w-full flex flex-row h-5 mb-8 items-center justify-center bg-violet-700 text-white text-lg font-semibold"><div  className="basis-1/2">Switches</div><RxDropdownMenu className="basis-1/2"></RxDropdownMenu></button>

      <div className="w-5/5">
            {showSwitches? switches.map((switchDevice: SwitchInterface) => {
              return (
                <div  key={switchDevice.id}>
                <SwitchModule switchDevice={switchDevice}></SwitchModule>
</div>
              );
            }): ""}
        
      </div>
      <div className="flex flex-row">
        <div className='bg-orange-400 basis-1/4'><p>ala</p></div>
        <div><p>beka</p></div>
      </div>
    </div>
  );
};

export default SwitchesList;
