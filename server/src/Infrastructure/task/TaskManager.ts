import { TaskManagerInterface } from "../../application/task/TaskManagerInterface";
import { Task } from "../../domain/Task";
import EventEmitter from "node:events";
import { TaskRepositoryInterface } from "../../application/task/TaskRepositoryInterface";
import { ManagerResponse } from "../../application/task/TaskManagerInterface";

export class TaskManager implements TaskManagerInterface {
  /*DBTaskInterface, CronTaskInterface*/
  delegate: TaskManagerInterface;
  taskRepository: TaskRepositoryInterface;
  constructor(
    delegate: TaskManagerInterface,
    taskRepository: TaskRepositoryInterface,
    eventEmitter: EventEmitter
  ) {
    this.handleEvent = this.handleEvent.bind(this);
    this.taskRepository = taskRepository;
    eventEmitter.on("deviceDeleted", this.handleEvent);
    this.delegate = delegate;
  }

  async addTask(task: Task): Promise<ManagerResponse<object|string>> {
    return this.delegate.addTask(task);
  }



  async handleEvent(deviceId: string) {
    await this.taskRepository.findTasksForDevice(deviceId)
      .then((tasks) => {
        Promise.all(tasks.map((task) => this.deleteTask(task.id)))
          .then((result) => console.log(result))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  async deleteTask(taskId: string): Promise<ManagerResponse<object|string>> {
    return this.delegate.deleteTask(taskId);
  }
}
