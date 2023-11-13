import React, { useEffect } from "react";
import { FaTrashRestoreAlt } from "react-icons/fa";
import { deleteTask } from "./services";

export interface Parameters {
  [key: string]: string;
}

export interface Task {
  id: string;
  scheduledTime: { hour: string; minutes: string };
  onStatus: boolean;
}

export const TaskModule: React.FC<{
  task: Task;
  setDeleted: (param: boolean) => void;
}> = (props) => {
  const token = localStorage.getItem("token");

  async function deleteItem() {
    const confirmation = confirm("Do you want to delete item?");
    if (confirmation) {
      try {
        const response = await deleteTask(props.task.id, token);
        const data = await response.json();
        if (response.ok) {
          props.setDeleted(true);
        } else {
          console.log("Task not deleted", data);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  }


  useEffect(()=>{
    'task module render'
  },[])
  return (
    <div className="flex flex-row justify-center items-center">
      <h1 className=" border border-black p-2 text-black rounded-xl text-lg font-semibold m-2">
        {props.task.onStatus ? "ON" : "OFF"}
        {` => ${props.task.scheduledTime.hour}: ${props.task.scheduledTime.minutes} `}
      </h1>
      <button
        onClick={() => deleteItem()}
        className="bg-red-500 px-1 py-1 text-white m-2 rounded"
      >
        <FaTrashRestoreAlt />
      </button>
    </div>
  );
};

export default TaskModule;
