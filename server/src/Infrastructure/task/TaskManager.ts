import { TaskManager } from "../../application/task/TaskManagerInterface";
import { Task } from "../../domain/Task";
import EventEmitter from "node:events";
import { TaskRepository } from "../../application/task/TaskRepository";
import { ManagerResponse } from "../../application/task/TaskManagerInterface";

export class TaskManager implements TaskManager {
  /*DBTaskInterface, CronTaskInterface*/
  delegate: TaskManager;
  taskRepository: TaskRepository;
  constructor(
    delegate: TaskManager,
    taskRepository: TaskRepository,
    eventEmitter: EventEmitter
  ) {
    this.handleEvent = this.handleEvent.bind(this);
    this.taskRepository = taskRepository;
    eventEmitter.on("deviceDeleted", this.handleEvent);
    this.delegate = delegate;
  }

  async add(task: Task): Promise<ManagerResponse<object | string>> {
    return this.delegate.add(task);
  }

  async handleEvent(deviceId: string) {
    await this.taskRepository
      .getByDevice(deviceId)
      .then((tasks) => {
        Promise.all(tasks.map((task) => this.delete(task.id)))
          .then((result) => console.log(result))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  async delete(taskId: string): Promise<ManagerResponse<object | string>> {
    return this.delegate.delete(taskId);
  }
}
