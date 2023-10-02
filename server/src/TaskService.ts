import { TaskInterface } from "./TaskInterface";
import { AggregatedTask } from "./domain/AggregatedTask";
import { Task } from "./domain/Task";

export class TaskService {
  private taskInterface: TaskInterface;
  constructor(taskInterface: TaskInterface) {
    this.taskInterface = taskInterface;
  }

  addTaskToDB(task: Task): Promise<string> {
    return this.taskInterface.addTaskToDB(task);
  }
  /*
  delettaskFromDB(taskId: string): Promise<boolean> {
    return this.taskInterface.deleteTaskFromDB(taskId);
  }
  getTaskListFromDB(): Promise<Task[]> {
    return this.taskInterface.getTaskListFromDB();
  }
*/

  async findTaskById(taskId: string): Promise<AggregatedTask | null> {
    return this.taskInterface.findTaskById(taskId);
  }
  async findAllTask(): Promise<AggregatedTask[] | null> {
    return this.taskInterface.findAllTask();
  }

  async addTaskToCron(task:AggregatedTask): Promise<string | null> {
   
    return this.taskInterface.addTaskToCron(task)}
  
  async findTaskWhereDeviceId (deviceId: string): Promise<Task[]|null>{
  return this.taskInterface.findTaskWhereDeviceId(deviceId)}

  
}
