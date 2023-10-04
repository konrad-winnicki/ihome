import React, { useState, useEffect, useCallback } from "react";
import {
  getTasksWhereDeviceId,
} from "./services";
import TaskModule, { TaskInterface } from "./TaskModule";

export interface Parameters {
  [key: string]: string;
}

interface TaskListInterface {
  deviceId: string;
}

const TaskList: React.FC<TaskListInterface> = (props) => {
  const [tasks, setTasks] = useState<TaskInterface[] | null>(null);

  const sortFunction = (data: TaskInterface[]) => {
    data.sort((a: TaskInterface, b: TaskInterface) => {
      const timeA =
        parseInt(a.scheduledTime.hour) * 60 + parseInt(a.scheduledTime.minutes);
      const timeB =
        parseInt(b.scheduledTime.hour) * 60 + parseInt(b.scheduledTime.minutes);

      return timeA - timeB;
    });
    return data;
  };

  const deviceId = props.deviceId;
  const getTasks = useCallback(async ()=> {
    const response = await getTasksWhereDeviceId(deviceId);
    if (response.ok) {
      const data = (await response.json()) as TaskInterface[];
      setTasks(sortFunction(data));
    }
  },[deviceId])

  useEffect(() => {
    getTasks();
    
  },[getTasks]);

  return (
    <div className="chatList flex items-center justify-center border-5 border-sky-500 m-4 p- flex flex-col rounded-lg">
      <h1 className="w-full border-b border-black py-2 text-black text-lg font-semibold">
        Current tasks
      </h1>
        {tasks?.map((task: TaskInterface) => {
          return <div key={task.id}><TaskModule task={task}></TaskModule></div>
        })}
        
    </div>
  );
};

export default TaskList;
