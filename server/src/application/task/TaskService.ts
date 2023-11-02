import { DeviceService } from "../device/DeviceService";
import { TaskManager } from "./TaskManager";
import { Task } from "../../domain/Task";
import EventEmitter from "node:events";

type ManagerResponse<T> = {
  [key: string]: T;
};

export class TaskService {
  private taskManager: TaskManager;
  private dviceService: DeviceService;


  constructor(
    taskManager: TaskManager,
    deviceService: DeviceService,
    eventEmitter: EventEmitter
  ) {
    this.taskManager = taskManager;
    this.dviceService = deviceService;
    this.handleEvent = this.handleEvent.bind(this);
    eventEmitter.on("deviceDeleted", this.handleEvent);
  }

  async add(task: Task): Promise<ManagerResponse<object | string>> {
    return this.dviceService
      .getById(task.deviceId)
      .catch((error: ManagerResponse<object>) => Promise.reject(error))
      .then(() => this.taskManager.add(task));
  }

  async delete(taskId: string): Promise<ManagerResponse<object | string>> {
    return this.taskManager.delete(taskId);
  }

  async handleEvent(deviceId: string) {
    await this.taskManager
      .getByDevice(deviceId)
      .then((tasks) => {
        Promise.all(tasks.map((task) => this.delete(task.id)))
          .then((result) => console.log(result))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  async getByDevice(deviceId: string): Promise<Task[]> {
    return this.taskManager.getByDevice(deviceId);
  }
}
