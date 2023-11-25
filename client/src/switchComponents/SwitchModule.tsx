import React, { useContext } from "react";
import { BiTask } from "react-icons/bi";
import ToggleSwitch from "./ToogleSwitch";
import { FaTrashRestoreAlt } from "react-icons/fa";
import { deleteDevice } from "../services";
import { AuthorizationContext } from "../contexts/AuthorizationContext";
import { SwitchModuleContext } from "../contexts/SwitchModuleContext";

/*
export interface Parameters {
  [key: string]: string;
}

export interface DeviceInterface {
  id: string;
  name: string;
  onStatus: boolean;
}
*/
export const SwitchModule: React.FC = () => {
  const token = localStorage.getItem("token");
  const authorizationContext = useContext(AuthorizationContext);
  const switchModuleContext = useContext(SwitchModuleContext);

  async function deleteItem() {
    const confirmation = confirm("Do you want to delete device?");
    if (confirmation) {
      const response = await deleteDevice(
        switchModuleContext.switchDevice.id,
        token
      );
      if (response.ok) {
        switchModuleContext.setRefreshList(true);
      }
      if (response.status === 401) {
        authorizationContext.setLoggedIn(false);
      }
    }
  }

  return (
    <div className="w-5/5 border-2 border-solid border-violet-700 p-0 rounded-xl m-2 justify-center items-center">
      <div className="flex">
        <div className=" flex basis-2/3 justify-center items-center bg-[#B804D8] p-2 text-white rounded-xl text-lg font-semibold m-2">{`${switchModuleContext.switchDevice.name}`}</div>

        <div className="flex basis-1/3 m-2 justify-center items-center">
          <ToggleSwitch></ToggleSwitch>
        </div>

        <div className="flex justify-center items-center">
          <button
            onClick={() => {
              switchModuleContext.setDeviceShowTaskModule(
                switchModuleContext.switchDevice
              );
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
