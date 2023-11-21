import React, { useState, useEffect, useCallback } from "react";

import { deleteDevice, runDevice } from "../services";
import { FaTrashRestoreAlt } from "react-icons/fa";

export interface SensorDescription {
  id: string;
  name: string;
  parameters: { [key: string]: string };
}

export interface Measurement {
  [key: string]: string;
}

interface SensorProps {
  sensor: SensorDescription;
  setDisplayData: (data: string[]) => void;
  setRefreshList: (param: boolean) => void;
}

const Sensor: React.FC<SensorProps> = (props) => {
  const [collectedData, setCollectedData] = useState<Measurement>({});
  const { sensor, setDisplayData, setRefreshList } = props;

  const sensorId = sensor.id;
  const token = localStorage.getItem("token");

  async function collectData() {
    setDisplayData(["Waiting"]);
    const response = await runDevice(sensorId, true, token);
    if (response.ok) {
      const measurements = await response.json();
      setCollectedData(measurements);
    } else {
      setDisplayData(["Error occurred:\n", "try again."]);
    }
  }

  async function deleteItem() {
    const confirmation = confirm("Do you want to delete device?");
    if (confirmation) {
      await deleteDevice(sensor.id, token);
      setRefreshList(true);
    }
  }

  const prepareDisplayData = useCallback(() => {
    const parametersWithUnits = sensor.parameters;
    const parameters = Object.keys(parametersWithUnits);
    const dataToPresent = [];
    for (const parameter of parameters) {
      const measurement = collectedData[parameter];
      const unit = parametersWithUnits[parameter];
      const singleDataToPresent = `${parameter}: ${measurement} ${unit} \n`;
      dataToPresent.push(singleDataToPresent);
    }
    return dataToPresent;
  }, [collectedData, sensor.parameters]);

  useEffect(() => {
    if (Object.keys(collectedData).length === 0) {
      //isInitialRender.current = false;
      //console.log('initial render', collectedData)
      return;
    } else {
      const dataToPresent = prepareDisplayData();
      setDisplayData(dataToPresent);
    }
  }, [prepareDisplayData, setDisplayData, collectedData]);

  return (
    <div className="grid grid-cols-4 gap-0">
      <div className="col-span-1 items-center"></div>
      <div className="col-span-2 items-center justify-center">
        <button
          className="w-4/4
           bg-[#B804D8] m-2 hover:bg-[#04D8B8] text-lg text-white font-semibold"
          onClick={() => collectData()}
        >
          {sensor.name}
        </button>
      </div>
      <div className="col-span-1 items-center justify-center">
        <button
          onClick={() => deleteItem()}
          className="bg-red-500 px-0.5 py-0.5 text-white m-6 rounded"
        >
          <FaTrashRestoreAlt />
        </button>
      </div>
    </div>
  );
};

export default Sensor;
