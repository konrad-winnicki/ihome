import { AppCron } from "../../domain/AppCron";
import { TaskManager } from "../../application/task/TaskManager";
import { ServerMessages } from "../../ServerMessages";
import { AggregatedTask } from "../../domain/AggregatedTask";

type ManagerResponse<T> = {
  [key: string]: T;
};

export class CronTaskManager implements TaskManager {
  private appCron: AppCron;
  private serverMessages: ServerMessages;

  constructor(appCron: AppCron, serverMessages: ServerMessages) {
    this.appCron = appCron;
    this.serverMessages = serverMessages;
  }

  async add(
    aggregatedTask: AggregatedTask
  ): Promise<ManagerResponse<object | string>> {
    return this.appCron
      .installTask(
        aggregatedTask.id,
        aggregatedTask.minutes,
        aggregatedTask.hour,
        aggregatedTask.onStatus
          ? aggregatedTask.commandOn
          : aggregatedTask.commandOff
          ? aggregatedTask.commandOff
          : ""
      )
      .then(() => {
        const message = this.serverMessages.addTask.SUCCESS;
        return Promise.resolve({ [message]: aggregatedTask.id });
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
