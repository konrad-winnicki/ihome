import { TaskRepository } from "./TaskRepository";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";
import { DeviceListingInterface } from "../device/DeviceListingInterface";

export class TaskService {
  private taskRepository: TaskRepository;
  private deviceService: DeviceListingInterface;

  constructor(
    taskRepository: TaskRepository,
    deviceService: DeviceListingInterface
  ) {
    this.taskRepository = taskRepository;
    this.deviceService = deviceService;
  }

  async addTask(task: Task): Promise<string> {
    // TODO: this.deviceService.findById(task.deviceId)
    return this.deviceService
      .getDeviceById(task.deviceId)
      .then(() => this.taskRepository.addTask(task))
      .catch((error) => Promise.reject(`Error occurred: ${error}`));
  }

  deleteTaskFromDB(taskId: string): Promise<string> {
    return this.taskRepository.deleteTask(taskId);
  }

  async findTaskById(taskId: string): Promise<AggregatedTask> {
    return this.taskRepository.findTaskById(taskId);
  }
  async findAllTask(): Promise<AggregatedTask[]> {
    return this.taskRepository.findAllTask();
  }

  async findTasksForDevice(deviceId: string): Promise<Task[]> {
    return this.taskRepository.findTasksForDevice(deviceId);
  }
}
