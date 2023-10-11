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
  const [showMeters, setShowMeters] = useState<boolean>(true);

  const token = localStorage.getItem("token");

  async function getMetersList() {
    const response = await getMeters(token);
    if (response.ok) {
      const data = await response.json();
      setMeters(data);
    }
  }

  useEffect(() => {
    getMetersList();
  }, [displayData]);

  return (
    <div className="flex-col h-full items-center justify-center border-5 border-sky-500">
      <MeterDisplay displayData={displayData}></MeterDisplay>
      <button className="w-full h-6 mb-2 flex flex-row items-center justify-center bg-[#0F28FA] text-white text-lg font-semibold"
      onClick={() =>
        showMeters ? setShowMeters(false) : setShowMeters(true)
      }
      
      >
        <div className="basis-1/2">Meters</div>
        <RxDropdownMenu className="basis-1/2"></RxDropdownMenu>
      </button>
<div className="overflow-y-auto">
      {showMeters
        ? meters.map((meter: MeterInterface) => {
            return (
              <div className="" key={meter.id}>
                <Meter meter={meter} setDisplayData={setDisplayData}></Meter>
              </div>
            );
          })
        : ""}
        </div>
    </div>
  );
};

export default MeterList;
