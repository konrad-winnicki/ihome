import React, { useState, useEffect} from "react";

import {getMeters } from "./services";
import Meter from "./Meter";
import MeterDisplay from "./MetersDisplay";

export interface Parameters {
  [key: string]: string;
}

export interface MeterInterface {
  id: string;
  name: string;
  parameters: Parameters;
}

export interface MeasurementInterface {
  [key: string]: string;
}

const MeterList: React.FC = () => {
  const [meters, setMeters] = useState<MeterInterface[]>([]);
  const [displayData, setDisplayData] = useState<string[]>([]);


  async function getMetersList() {
    const response = await getMeters();
    if (response.ok) {
      const data = await response.json();
      setMeters(data);
    }
  }

  
  useEffect(() => {
    getMetersList();
  }, [displayData]);

 

  return (
    <div className="chatList flex items-center justify-center border-5 border-sky-500 m-4 p- flex flex-col rounded-lg">
    <MeterDisplay displayData={displayData}></MeterDisplay>

    <h1 className="w-full bg-blue-700 p-0 text-white rounded-xl text-2l font-semibold m-0">Meteres</h1>

      <div className="grid grid-cols-2 gap-4">
        
          <div>
            {meters.map((meter: MeterInterface) => {
              return (
                <div key={meter.id}>
                <Meter meter={meter} setDisplayData={setDisplayData}></Meter>
                </div>
              );
            })}
          </div>
        
      </div>
    </div>
  );
};

export default MeterList;
