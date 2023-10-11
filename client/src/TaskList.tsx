import React, { useState, useEffect, useCallback } from "react";
import { getTasksWhereDeviceId } from "./services";
import TaskModule, { TaskInterface } from "./TaskModule";
import { SwitchInterface } from "./SwitchesList";
import { RiDeleteBack2Line } from "react-icons/ri";
import { TaskSetter } from "./TaskSetter";

export interface Parameters {
  [key: string]: string;
}

interface TaskListInterface {
  device: SwitchInterface;
  setDeviceShowTaskModule: (param: SwitchInterface | null) => void;
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
  const token = localStorage.getItem("token");

  const deviceId = props.device.id;
  const getTasks = useCallback(async () => {
    const response = await getTasksWhereDeviceId(deviceId, token);
    if (response.ok) {
      const data = (await response.json()) as TaskInterface[];
      setTasks(sortFunction(data));
    }
  }, [deviceId]);

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  return (
    <div className="chatList flex justify-center border-5 border-sky-500 m-4 p- flex flex-col rounded-lg">
      
      <button
        onClick={() => {
          props.setDeviceShowTaskModule(null);
        }}
        className="bg-[#B804D8] px-1 py-1 text-white m-1 mr-4 rounded text-white text-lg font-semibold"
      >
        <div className="flex justify-center items-center">
          <div className="w-3/4 mr-4 inline-block">{props.device.name}</div>
          <RiDeleteBack2Line className="w-1/4 float-right inline-block"></RiDeleteBack2Line>
        </div>
      </button>

      <h1 className="border-b border-black m-2 text-black  text-1l font-semibold">
              Add new task
            </h1>
            <div className="dd">
              <TaskSetter
                setShowTaskDetails={props.setDeviceShowTaskModule}
                switchId={props.device.id}
              ></TaskSetter>
            </div>


      <h1 className="w-full border-b border-black py-2 text-black text-lg font-semibold">
        Current tasks
      </h1>
      
      <div>
        {tasks?.map((task: TaskInterface) => {
          return (
            <div key={task.id}>
              <TaskModule task={task}></TaskModule>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;
