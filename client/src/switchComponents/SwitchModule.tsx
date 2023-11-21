import React, { useEffect } from "react";
import { BiTask } from "react-icons/bi";
import ToggleSwitch from "./ToogleSwitch";
import { FaTrashRestoreAlt } from "react-icons/fa";
import { deleteDevice } from "../services";
import { SwitchInterface } from "./SwitchList";

export interface Parameters {
  [key: string]: string;
}

export interface SwitchModuleInterface {
  switchDevice: SwitchInterface;
  setShowTaskDetails: (param: DeviceInterface | null) => void;
  setRefreshList: (param: boolean) => void;
}

export interface DeviceInterface {
  id: string;
  name: string;
  onStatus: boolean;
}

export const SwitchModule: React.FC<SwitchModuleInterface> = (props) => {
  const token = localStorage.getItem("token");

  async function deleteItem() {
    const confirmation = confirm("Do you want to delete device?");
    if (confirmation) {
      await deleteDevice(props.switchDevice.id, token);
      props.setRefreshList(true);
    }
  }

  useEffect(() => {
    console.log("switch module render");
    console.log(props.switchDevice);
  }, []);

  return (
    <div className="w-5/5 border-2 border-solid border-violet-700 p-0 rounded-xl m-2 justify-center items-center">
      <div className="flex">
        <div className=" flex basis-2/3 justify-center items-center bg-[#B804D8] p-2 text-white rounded-xl text-lg font-semibold m-2">{`${props.switchDevice.name}`}</div>

        <div className="flex basis-1/3 m-2 justify-center items-center">
          <ToggleSwitch switchDevice={props.switchDevice}></ToggleSwitch>
        </div>

        <div className="flex justify-center items-center">
          <button
            onClick={() => {
              props.setShowTaskDetails(props.switchDevice);
            }}
            className="bg-[#B804D8] px-1 py-1 text-white m-1 mr-4 rounded text-white text-lg font-semibold"
          >
            <BiTask />
          </button>
        </div>
        <div className="flex justify-center items-center">
          <button
            onClick={() => deleteItem()}
            className="bg-red-500 px-0.5 py-0.5 text-white m-2 rounded"
          >
            <FaTrashRestoreAlt />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwitchModule;
