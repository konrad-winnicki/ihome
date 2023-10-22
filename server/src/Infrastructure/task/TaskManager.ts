import { TaskManagerInterface } from "../../application/task/TaskManagerInterface";
import { Task } from "../../domain/Task";
import { AggregatedTask } from "../../domain/AggregatedTask";
import EventEmitter from "node:events";
import { TaskRepository } from "../../application/task/TaskRepository";

export class TaskManager implements TaskManagerInterface {
  /*DBTaskInterface, CronTaskInterface*/
  delegate: TaskManagerInterface;
  taskRepository: TaskRepository;
  constructor(
    delegate: TaskManagerInterface,
    taskRepository: TaskRepository,
    eventEmitter: EventEmitter
  ) {
    this.handleEvent = this.handleEvent.bind(this);
    this.taskRepository = taskRepository;
    eventEmitter.on("deviceDeleted", this.handleEvent);
    this.delegate = delegate;
  }

  async addTask(task: Task): Promise<string> {
    return this.delegate.addTask(task);
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

  async handleEvent(deviceId: string) {
    await this.findTasksForDevice(deviceId)
      .then((tasks) => {
        Promise.all(tasks.map((task) => this.deleteTask(task.id)))
          .then((result) => console.log(result))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  async deleteTask(taskId: string): Promise<string> {
    return this.delegate.deleteTask(taskId);
  }
}
