import React, { useState, useEffect } from "react";
import { FaTrashRestoreAlt } from "react-icons/fa";

import { getMeasurement, getMeters, getSwitches, getTasks, getTasksWhereDeviceId } from "./services";
import ToggleSwitch from "./ToogleSwitch";
import SwitchModule from "./SwitchModule";
import TaskModule, { TaskInterface } from "./TaskModule";

export interface Parameters {
  [key: string]: string;
}

interface TaskListInterface{
  deviceId: string
}


const TaskList: React.FC<TaskListInterface> = (props) => {
  const [tasks, setTasks] = useState<TaskInterface[]|null>(null);
  const [actualMeterId, setActualMeterId] = useState<string | null>(null);

const sortFunction =(data: TaskInterface[])=>{ data.sort((a:TaskInterface, b:TaskInterface) => {
  const timeA = parseInt(a.scheduledTime.hour) * 60 + parseInt(a.scheduledTime.minutes);
  const timeB = parseInt(b.scheduledTime.hour) * 60 + parseInt(b.scheduledTime.minutes);

  return timeA - timeB;
})
return data}

  const deviceId = props.deviceId
  async function getTasks() {
    const response = await getTasksWhereDeviceId(deviceId);
    if (response.ok) {
      const data = await response.json() as TaskInterface[]
      setTasks(sortFunction(data));
    }
  }



  const firstRender = React.useRef(true);
  useEffect(() => {
    console.log('TASKS', tasks)
    if (!tasks) {
      getTasks()
    } else {
      firstRender.current = false;
    }
  }, [tasks]);

  

 

  return (
    <div className="chatList flex items-center justify-center border-5 border-sky-500 m-4 p- flex flex-col rounded-lg">
    <h1 className="w-full border-b border-black py-2 text-black  text-2l font-semibold">Current tasks</h1>

      <div className="gap-2">
            {tasks?.map((task: TaskInterface) => {
              return (
                <TaskModule task={task}></TaskModule>

              );
            })}
        
      </div>
    </div>
  );
};

export default TaskList;
