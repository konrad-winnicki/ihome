import React, { useState, useEffect, useRef, useCallback } from "react";

import { deleteDevice, runDevice } from "./services";
import { FaTrashRestoreAlt } from "react-icons/fa";

export interface MeterDescription {
  id: string;
  name: string;
  parameters: { [key: string]: string };
}

export interface Measurement {
  [key: string]: string;
}

interface MeterProps {
  meter: MeterDescription;
  setDisplayData: (data: string[]) => void;
  setRefreshList: (param: boolean) => void;
}

const Meter: React.FC<MeterProps> = (props) => {
  const [collectedData, setCollectedData] = useState<Measurement>({});
  const { meter, setDisplayData, setRefreshList } = props;
  const isInitialRender = useRef(true);

  const meterId = meter.id;
  const token = localStorage.getItem("token");

  async function collectData() {
    setDisplayData(["Waiting"]);
    const response = await runDevice(meterId, true, token);
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
      await deleteDevice(props.meter.id, token);
      setRefreshList(true);
    }
  }

  const prepareDisplayData = useCallback(() => {
    const parametersWithUnits = meter.parameters;
    const parameters = Object.keys(parametersWithUnits);
    const dataToPresent = [];
    for (const parameter of parameters) {
      const measurement = collectedData[parameter];
      const unit = parametersWithUnits[parameter];
      const singleDataToPresent = `${parameter}: ${measurement} ${unit} \n`;
      dataToPresent.push(singleDataToPresent);
    }
    return dataToPresent;
  }, [collectedData, meter.parameters]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    } else {
      const dataToPresent = prepareDisplayData();
      setDisplayData(dataToPresent);
    }
  }, [prepareDisplayData, setDisplayData]);

  return (
    <div className="flex items-center">
      <div className="w-3/4">
        <button
          className="w-1/2
           bg-[#B804D8] m-2 hover:bg-[#04D8B8] text-lg text-white font-semibold"
          onClick={() => collectData()}
        >
          {meter.name}
        </button>
      </div>
      <div className="w-1/4 items-center">
        <button
          onClick={() => deleteItem()}
          className="bg-red-500 px-0.5 py-0.5 text-white m-2 rounded"
        >
          <FaTrashRestoreAlt />
        </button>
      </div>
    </div>
  );
};

export default Meter;
