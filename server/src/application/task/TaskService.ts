import { DBTaskInterface } from "./DBTaskInterface";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";
import { CronTaskInterface } from "./CronTaskInterface";

export class TaskService {
  private taskInterface: DBTaskInterface & CronTaskInterface;

  constructor(taskInterface: DBTaskInterface & CronTaskInterface) {
    this.taskInterface = taskInterface;
  }

  addTask(task: Task): Promise<string> {
    return this.taskInterface.addTask(task);
  }

  deleteTaskFromDB(taskId: string): Promise<string> {
    return this.taskInterface.deleteTask(taskId);
  }
  /*
  getTaskListFromDB(): Promise<Task[]> {
    return this.taskInterface.getTaskListFromDB();
  }
*/

  async findTaskById(taskId: string): Promise<AggregatedTask> {
    return this.taskInterface.findTaskById(taskId);
  }
  async findAllTask(): Promise<AggregatedTask[]> {
    return this.taskInterface.findAllTask();
  }

  async transformTaskFromDbToCron(): Promise<string | null> {
    return this.taskInterface.transformTaskFromDbToCron();
  }

  async findTasksForDevice(deviceId: string): Promise<Task[]> {
    return this.taskInterface.findTasksForDevice(deviceId);
  }
}
