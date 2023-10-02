import React, { useState, useEffect, useRef } from "react";

import { getMeasurement, getMeters } from "./services";

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
  const [measurements, setMeasurements] = useState<Parameters>({});
  const [actualMeterId, setActualMeterId] = useState<string | null>(null);
  const [renderData, setRenderData] = useState<string>("");

  const isInitialRender = useRef(true);

  async function getMetersList() {
    const response = await getMeters();
    if (response.ok) {
      const data = await response.json();
      setMeters(data);
    }
  }

  async function meterOn(meterId: string) {
    const response = await getMeasurement(meterId);
    console.log("run meter");
    if (response.ok) {
      const data = await response.json();
      setActualMeterId(meterId);
      setMeasurements(data);
      
    }
  }

  function prepareRenderdata() {
    const meter = meters.filter((meter) => meter.id == actualMeterId);
    const meterParameters = meter[0]?.parameters;
    console.log(meterParameters);
    const keys = Object.keys(meterParameters);
    let string = "";
    for (const key of keys) {
      const measurementValue: string = measurements[key];
      const unit = meterParameters[key];
      const curSt = `${key}: ${measurementValue} ${unit} \n`;
      string = string + curSt;
    }
    setRenderData(string);
  }
  useEffect(() => {
    getMetersList();
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }else{
      prepareRenderdata();

    }
  }, [measurements]);

  return (
    <div className="chatList flex items-center justify-center border-5 border-sky-500 m-4 p- flex flex-col rounded-lg">
    <h1 className="w-full bg-blue-700 p-0 text-white rounded-xl text-2l font-semibold m-0">Meteres</h1>

      <div className="grid grid-cols-2 gap-4">
        
        <div>{`${renderData}`}</div>
          <div>
            {meters.map((meter: MeterInterface) => {
              return (
                <div key={meter.id}>
                  <p>
                    <button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-lg text-white py-1 px-2 rounded-md my-1 shadow-md"
                      onClick={() => meterOn(meter.id)}
                      id={meter.id}
                    >
                      {meter.name}
                    </button>
                  </p>
                </div>
              );
            })}
          </div>
        
      </div>
    </div>
  );
};

export default MeterList;
