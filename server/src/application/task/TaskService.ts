import { DBTaskInterface } from "./DBTaskInterface";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";
import { CronTaskInterface } from "./CronTaskInterface";

export class TaskService {
  private taskInterface: DBTaskInterface & CronTaskInterface;

  constructor(taskInterface: DBTaskInterface & CronTaskInterface) {
    this.taskInterface = taskInterface;
  }

  transformTaskFromDbToCron(task: Task): Promise<string> {
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

  async findTaskById(taskId: string): Promise<AggregatedTask | null> {
    return this.taskInterface.findTaskById(taskId);
  }
  async findAllTask(): Promise<AggregatedTask[] | null> {
    return this.taskInterface.findAllTask();
  }

  async addTaskToCron(): Promise<string | null> {
    return this.taskInterface.transformTaskFromDbToCron();
  }

  async findTasksForDevice(deviceId: string): Promise<Task[] | null> {
    return this.taskInterface.findTasksForDevice(deviceId);
  }
}
