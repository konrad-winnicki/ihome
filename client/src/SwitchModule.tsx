import React, { useState, useEffect } from "react";
import { BiTask } from "react-icons/bi";
import { RiDeleteBack2Line } from "react-icons/ri";
import ToggleSwitch from "./ToogleSwitch";
import { TaskSetter } from "./TaskSetter";
import TaskList from "./TaskList";
import { FaTrashRestoreAlt } from "react-icons/fa";
import { deleteDevice } from "./services";

export interface Parameters {
  [key: string]: string;
}

export interface SwitchInterface {
  id: string;
  name: string;
  onStatus: boolean;
}

export const SwitchModule: React.FC<{ switchDevice: SwitchInterface }> = (
  props
) => {
  //switchId={props.switchDevice.id}
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  useEffect(() => {}, [showTaskDetails]);

  return (
    <div className="w-5/5 border-2 border-solid border-violet-700 p-0 rounded-xl m-2 justify-center items-center">
      <div className="flex">
        <div className=" flex basis-2/3 justify-center items-center bg-violet-600 p-2 text-white rounded-xl text-lg font-semibold m-2">{`${props.switchDevice.name}`}</div>

        {!showTaskDetails ? (
          <div className="flex basis-1/3 m-2 justify-center items-center">
            <ToggleSwitch switchId={props.switchDevice.id}></ToggleSwitch>
          </div>
        ) : (
          ""
        )}
        <div className="flex justify-center items-center">
          <button
            onClick={() => {
              !showTaskDetails
                ? setShowTaskDetails(true)
                : setShowTaskDetails(false);
            }}
            className="bg-violet-500 px-1 py-1 text-white m-1 mr-4 rounded"
          >
            {!showTaskDetails ? <BiTask /> : <RiDeleteBack2Line />}
          </button>
        </div>
        <div className="flex justify-center items-center">
        {! showTaskDetails? <button
          onClick={() => {deleteDevice(props.switchDevice.id)}}
          className="bg-red-500 px-0.5 py-0.5 text-white m-2 rounded"
        >
          <FaTrashRestoreAlt />
        </button>: ''}
        </div>
      </div>

      <div className="">
        {showTaskDetails ? (
          <div>
            <h1 className="border-b border-black m-2 text-black  text-1l font-semibold">
              Add new task
            </h1>
          <div className="dd">
            <TaskSetter 
              setShowTaskDetails={setShowTaskDetails}
              switchId={props.switchDevice.id}
            ></TaskSetter>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="flex-row">
        {showTaskDetails ? (
          <TaskList deviceId={props.switchDevice.id}></TaskList>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default SwitchModule;
