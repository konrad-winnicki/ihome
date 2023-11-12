import React, { useState, useEffect, useRef } from "react";

import { getMeasurement, runDevice } from "./services";

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
  meter: MeterInterface;
  setDisplayData: (data: string[]) => void;
}

const Meter: React.FC<MeterProps> = (props) => {
  const [measurements, setMeasurements] = useState<Parameters>({});

  const isInitialRender = useRef(true);

  const meterId = props.meter.id;
  const token = localStorage.getItem("token");

  async function meterOn() {
    props.setDisplayData(["Waiting"]);
    const response = await runDevice(meterId, true, token);
    console.log("run meter");
    if (response.ok) {
      const data = await response.json();
      setMeasurements(data);
    }
  }

  function prepareRenderdata() {
    const meterParameters = props.meter.parameters;
    const keys = Object.keys(meterParameters);
    const renderData = [];
    for (const key of keys) {
      const measurementValue: string = measurements[key];
      const unit = meterParameters[key];
      const curSt = `${key}: ${measurementValue} ${unit} \n`;
      renderData.push(curSt);
    }
    return renderData;
  }

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    } else {
      const dataToRender = prepareRenderdata();
      props.setDisplayData(dataToRender);
    }
  }, [measurements]);

  return (
    <button
      className="w-2/6 bg-[#B804D8] m-1 hover:bg-[#04D8B8] text-lg text-white font-semibold"
      onClick={() => meterOn()}
    >
      {props.meter.name}
    </button>
  );
};

export default Meter;
