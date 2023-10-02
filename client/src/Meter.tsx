import React, { useState, useEffect, useRef } from "react";

import { getMeasurement} from "./services";

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

interface MeterProps {
    meter: MeterInterface
    setDisplayData: (data:string[])=>void
}

const Meter: React.FC<MeterProps> = (props) => {
  const [measurements, setMeasurements] = useState<Parameters>({});

  const isInitialRender = useRef(true);

  const meterId = props.meter.id
  
  async function meterOn() {
    props.setDisplayData(['Waiting'])
    const response = await getMeasurement(meterId);
    console.log("run meter");
    if (response.ok) {
      const data = await response.json();
      setMeasurements(data);
      
    }
  }

  function prepareRenderdata() {
    const meterParameters = props.meter.parameters;
    const keys = Object.keys(meterParameters);
    const renderData = []
    for (const key of keys) {
      const measurementValue: string = measurements[key];
      const unit = meterParameters[key];
      const curSt = `${key}: ${measurementValue} ${unit} \n`;
      renderData.push(curSt)
    }
    return renderData
  }
  

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    } else {
        const dataToRender = prepareRenderdata()
        props.setDisplayData(dataToRender)
    }

  }, [measurements]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div >
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-lg text-white py-1 px-2 rounded-md my-1 shadow-md"
          onClick={() => meterOn()}
        >
          {props.meter.name}
        </button>
      </div>
    </div>
  );
};

export default Meter;
