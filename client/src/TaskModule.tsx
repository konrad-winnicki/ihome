import React from "react";
import { FaTrashRestoreAlt } from "react-icons/fa";
import { deleteTask } from "./services";

export interface Parameters {
  [key: string]: string;
}

export interface TaskInterface {
  id: string;
  scheduledTime: { hour: string; minutes: string };
  onStatus: boolean;
}

export const TaskModule: React.FC<{ task: TaskInterface }> = (props) => {
  const token = localStorage.getItem("token");

  return (
    <div
      className="flex flex-row justify-center items-center"

    >
      <h1 className=" border border-black p-2 text-black rounded-xl text-lg font-semibold m-2">
        {`Switch time => ${props.task.scheduledTime.hour}: ${props.task.scheduledTime.minutes} `}
        {props.task.onStatus ? "ON" : "OFF"}
      </h1>
        <button
          onClick={() => {deleteTask(props.task.id, token)}}
          className="bg-red-500 px-1 py-1 text-white m-2 rounded"
        >
          <FaTrashRestoreAlt />
        </button>
    </div>
  );
};

export default TaskModule;
