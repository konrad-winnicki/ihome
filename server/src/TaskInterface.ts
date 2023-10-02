import { AggregatedTask } from "./domain/AggregatedTask";
import {  Task } from "./domain/Task";


export interface TaskInterface {
    addTaskToDB: (task: Task) => Promise<string>;
   // deleteTaskFromDB: (taskId: string) => Promise<boolean>;
    //getTaskListFromDB: () => Promise<Task[]>;
    findTaskById: (taskId: string) => Promise<AggregatedTask|null>
    findTaskWhereDeviceId: (deviceId: string) => Promise<Task[]|null>
    findAllTask: () => Promise<AggregatedTask[]|null>

    addTaskToCron: (task:AggregatedTask) => string|null
   // deleteTaskFromCron: (taskId:string)=> boolean
}
