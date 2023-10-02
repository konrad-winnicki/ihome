import React, { useState, useEffect } from "react";
import { BiTask } from "react-icons/bi";
import { ImCancelCircle } from "react-icons/im";
import { getMeasurement, getMeters, getSwitches } from "./services";
import ToggleSwitch from "./ToogleSwitch";
import { Time } from "./time";
import TaskModule from "./TaskModule";
import TaskList from "./TaskList";

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
  const [taskDetails, setTaskDetails] = useState(false);

  useEffect(() => {}, [taskDetails]);

  return (
    <div
      className="flex flex-col border-2 border-solid border-violet-700 p-0 rounded-xl m-4 justify-center items-center"
      key={props.switchDevice.id}
    >
      <div className="flex-row">

        <div className="flex">
        <h1 className=" flex justify-center items-center bg-violet-700 p-2 text-white rounded-xl text-2l font-semibold m-4">{`${props.switchDevice.name}`}</h1>

          {!taskDetails ? (
            <div className="flex justify-center items-center">
              <ToggleSwitch switchId={props.switchDevice.id}></ToggleSwitch>
            </div>
          ) : (
            ""
          )}
          <div>
            <button
              onClick={() => {
                !taskDetails ? setTaskDetails(true) : setTaskDetails(false);
              }}
              className="bg-red-500 text-white m-4 py-2 rounded"
            >
              {!taskDetails ? <BiTask /> : <ImCancelCircle />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-row">
        {taskDetails ? (
          <div>
          <h1 className="w-full border-b border-black py-2 text-black  text-2l font-semibold">Add new task</h1>

          <Time
            setIsTime={setTaskDetails}
            switchId={props.switchDevice.id}
          ></Time>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="flex-row">
        {taskDetails ? (
          <TaskList deviceId={props.switchDevice.id}></TaskList>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default SwitchModule;
