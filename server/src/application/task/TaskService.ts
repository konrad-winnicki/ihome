import { TaskRepository } from "./TaskRepository";
import { Task } from "../../domain/Task";
import { DeviceListingInterface } from "../device/DeviceListingInterface";
import { TaskManager } from "./TaskManagerInterface";
import { ManagerResponse } from "./TaskManagerInterface";

export class TaskService {
  private taskManager: TaskManager;
  private taskRepository: TaskRepository;
  private deviceService: DeviceListingInterface;

  constructor(
    taskManager: TaskManager,
    taskRapository: TaskRepository,
    deviceService: DeviceListingInterface
  ) {
    this.taskManager = taskManager;
    this.taskRepository = taskRapository;
    this.deviceService = deviceService;
  }

  async addTask(task: Task): Promise<ManagerResponse<object | string>> {
    // TODO: this.deviceService.findById(task.deviceId)
    return this.deviceService
      .getDeviceById(task.deviceId)
      .then(() => this.taskManager.add(task))
      .catch((error) => Promise.reject(error));
  }

  deleteTaskFromDB(taskId: string): Promise<ManagerResponse<object | string>> {
    return this.taskManager.delete(taskId);
  }

  async findTasksForDevice(deviceId: string): Promise<Task[]> {
    return this.taskRepository.getByDevice(deviceId);
  }
}
