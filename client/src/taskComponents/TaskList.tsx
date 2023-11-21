import React, { useState, useEffect, useCallback, useContext } from "react";
import { getTasksWhereDeviceId } from "../services";
import TaskModule, { Task } from "./TaskModule";
import { SwitchInterface } from "../switchComponents/SwitchList";
import { RiDeleteBack2Line } from "react-icons/ri";
import { TaskSetter } from "./TaskSetter";
import { AuthorizationContext } from "../contexts/AuthorizationContext";

export interface Parameters {
  [key: string]: string;
}

interface TaskListInterface {
  device: SwitchInterface;
  setDeviceShowTaskModule: (param: SwitchInterface | null) => void;
  setShowSwitches: (param: boolean) => void;
  //setTask: (param: TaskInterface | null) => void
}

const TaskList: React.FC<TaskListInterface> = (props) => {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [isNewAdded, setNewAdded] = useState<boolean>(false);
  const [isDeleted, setDeleted] = useState<boolean>(false);
  const authorizationContext = useContext(AuthorizationContext);

  const sortFunction = (data: Task[]) => {
    data.sort((a: Task, b: Task) => {
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
      const data = (await response.json()) as Task[];
      return sortFunction(data);
    }
    if (response.status === 401) {
      authorizationContext.setIsLoggedIn(false);
      return Promise.reject();
    }
    return Promise.reject();
  }, [deviceId, token, authorizationContext]);

  useEffect(() => {
    getTasks().then((tasks) => setTasks(tasks));
  }, [getTasks, isNewAdded, isDeleted]);

  useEffect(() => {
    if (isNewAdded) {
      setNewAdded(false);
    }
    if (isDeleted) {
      setDeleted(false);
    }
  }, [isNewAdded, isDeleted]);

  return (
    <div className="chatList flex justify-center border-5 border-sky-500 m-4 p- flex flex-col rounded-lg">
      <button
        onClick={() => {
          props.setDeviceShowTaskModule(null);
          props.setShowSwitches(true);
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
          setNewAdded={setNewAdded}
          switchId={props.device.id}
        ></TaskSetter>
      </div>

      <h1 className="w-full border-b border-black py-2 text-black text-lg font-semibold">
        Current tasks
      </h1>

      <div>
        {tasks?.map((task: Task) => {
          return (
            <div key={task.id}>
              <TaskModule task={task} setDeleted={setDeleted}></TaskModule>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;
