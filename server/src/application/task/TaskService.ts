import { DBTaskInterface } from "./DBTaskInterface";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";
import { CronTaskInterface } from "./CronTaskInterface";
import { DeviceListingInterface } from "../device/DeviceListingInterface";

export class TaskService {
  private taskInterface: DBTaskInterface & CronTaskInterface;
  private deviceService: DeviceListingInterface;

  constructor(
    taskInterface: DBTaskInterface & CronTaskInterface,
    deviceService: DeviceListingInterface
  ) {
    this.taskInterface = taskInterface;
    this.deviceService = deviceService;
  }

  async addTask(task: Task): Promise<string> {
    // TODO: this.deviceService.findById(task.deviceId)
    return this.deviceService
      .getDeviceById(task.deviceId)
      .then(() => this.taskInterface.addTask(task))
      .catch((error)=> Promise.reject(`Error occurred: ${error}`));

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
