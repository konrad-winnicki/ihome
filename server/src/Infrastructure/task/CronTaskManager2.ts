import { AppCron } from "../../domain/AppCron";
import { TaskManager } from "../../application/task/TaskManager";
import { ServerMessages } from "../../ServerMessages";
import { AggregatedTask as Task } from "../../domain/AggregatedTask";
import { TaskRepository } from "../../application/task/TaskRepository";

type ManagerResponse<T> = {
  [key: string]: T;
};

export class CronTaskManager implements TaskManager {
  private appCron: AppCron;
  private delegate: TaskRepository
  private serverMessages: ServerMessages;

  constructor(appCron: AppCron, delegate: TaskRepository, serverMessages: ServerMessages) {
    this.appCron = appCron;
    this.delegate = delegate
    this.serverMessages = serverMessages;
  }

  async add(
    task: Task
  ): Promise<ManagerResponse<object | string>> {
    this.delegate.add(task)
    return this.appCron
      .installTask(
        task.id,
        task.minutes,
        task.hour,
        task.onStatus
          ? task.commandOn
          : task.commandOff
          ? task.commandOff
          : ""
      )
      .then(() => {
        const message = this.serverMessages.addTask.SUCCESS;
        return Promise.resolve({ [message]: task.id });
      })
      .catch((error) => {
        const message = this.serverMessages.addTask.FAILURE;
        const rejectMessage = { [message]: error };
        return Promise.reject(rejectMessage);
      });
  }

  async delete(taskId: string): Promise<ManagerResponse<object | string>> {
    return this.appCron
      .deleteTask(taskId)
      .then(() => {
        const messageSucces = this.serverMessages.deleteTask.SUCCESS;
        const resolveMessage = { [messageSucces]: "No errors" };
        return Promise.resolve(resolveMessage);
      })
      .catch((error) => {
        const messageFailure = this.serverMessages.deleteTask.FAILURE;
        const rejectMessage = { [messageFailure]: error };
        return Promise.reject(rejectMessage);
      });
  }
}
