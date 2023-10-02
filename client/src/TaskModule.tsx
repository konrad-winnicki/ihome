import React from "react";
import { FaTrashRestoreAlt } from "react-icons/fa";

export interface Parameters {
  [key: string]: string;
}

export interface TaskInterface {
  id: string;
  scheduledTime: { hour: string; minutes: string };
  onStatus: boolean;
}

export const TaskModule: React.FC<{ task: TaskInterface }> = (props) => {
  
  return (
    <div
      className=" display: flex justify-center items-center"

    >
      <h1 className=" border border-black p-2 text-black rounded-xl text-2l font-semibold m-2">
        {`Switch time:  ${props.task.scheduledTime.hour}: ${props.task.scheduledTime.minutes}`}
        {props.task.onStatus ? "ON" : "OFF"}
      </h1>
      <div className="flex justify-center items-center">
        <button
          onClick={() => console.log("delete")}
          className="bg-red-500 text-white m-2 py-2 rounded"
        >
          <FaTrashRestoreAlt />
        </button>
      </div>
    </div>
  );
};

export default TaskModule;
