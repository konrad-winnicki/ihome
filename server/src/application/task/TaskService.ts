import { TaskRepositoryInterface } from "./TaskRepositoryInterface";
import { Task } from "../../domain/Task";
import { DeviceListingInterface } from "../device/DeviceListingInterface";
import { TaskManagerInterface } from "./TaskManagerInterface";
import { ManagerResponse } from "./TaskManagerInterface";


export class TaskService {
  private taskManager: TaskManagerInterface;
  private taskRepository: TaskRepositoryInterface
  private deviceService: DeviceListingInterface;

  constructor(
    taskManager: TaskManagerInterface,
    taskRapository: TaskRepositoryInterface,
    deviceService: DeviceListingInterface
  ) {
    this.taskManager = taskManager;
    this.taskRepository = taskRapository
    this.deviceService = deviceService;
  }

  async addTask(task: Task): Promise<ManagerResponse<object|string>> {
    // TODO: this.deviceService.findById(task.deviceId)
    return this.deviceService
      .getDeviceById(task.deviceId)
      .then(() => this.taskManager.addTask(task))
      .catch((error) => Promise.reject(error));
  }

  deleteTaskFromDB(taskId: string): Promise<ManagerResponse<object|string>> {
    return this.taskManager.deleteTask(taskId);
  }


  async findTasksForDevice(deviceId: string): Promise<Task[]> {
    return this.taskRepository.findTasksForDevice(deviceId);
  }
}
