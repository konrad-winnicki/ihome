import React, { useState, useEffect } from "react";

import { getMeters } from "./services";
import Meter from "./Meter";
import MeterDisplay from "./MetersDisplay";
import { RxDropdownMenu } from "react-icons/rx";

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
    <div className="MeterListflex items-center justify-center border-5 border-sky-500 flex flex-col">
      <MeterDisplay displayData={displayData}></MeterDisplay>
      <button className="w-full h-5 mb-8 flex flex-row items-center justify-center bg-[#0F28FA] text-white text-lg font-semibold">
        <div className="basis-1/2">Meters</div>
        <RxDropdownMenu className="basis-1/2"></RxDropdownMenu>
      </button>

          {meters.map((meter: MeterInterface) => {
            return (
              <div className="w-full" key={meter.id}>
                <Meter meter={meter} setDisplayData={setDisplayData}></Meter>
              </div>
            );
          })}
    </div>
  );
};

export default MeterList;
