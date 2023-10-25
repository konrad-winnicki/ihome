import { AppCron } from "../../domain/AppCron";
import { TaskManager } from "../../application/task/TaskManagerInterface";
import { ServerMessages } from "../../ServerMessages";
import { AggregatedTask } from "../../domain/AggregatedTask";

type ManagerResponse<T> = {
  [key: string]: T;
};

export class CronTaskManager implements TaskManager {
  private appCron: AppCron;
  private serverMessages: ServerMessages;

  constructor(
    appCron: AppCron,
    serverMessages: ServerMessages
  ) {
    this.appCron = appCron;
    this.serverMessages = serverMessages;
  }

  async add(
    aggregatedTask: AggregatedTask
  ): Promise<ManagerResponse<object | string>> {
    return new Promise((resolve, reject) => {
      try {
        this.appCron.installTask(
          aggregatedTask.id,
          aggregatedTask.minutes,
          aggregatedTask.hour,
          aggregatedTask.onStatus
            ? aggregatedTask.commandOn
            : aggregatedTask.commandOff
            ? aggregatedTask.commandOff
            : ""
        );
        const message = this.serverMessages.addTask.SUCCESS;
        return resolve({ [message]: aggregatedTask.id });
      } catch (error) {
        const message = this.serverMessages.addTask.FAILURE;
        const rejectMessage = { [message]: error };
        return reject(rejectMessage);
      }
    });
  }

  async delete(taskId: string): Promise<ManagerResponse<object | string>> {
    return new Promise((resolve, reject) => {
      try {
        this.appCron.deleteTask(taskId);

        const messageSucces = this.serverMessages.deleteTask.SUCCESS;
        const resolveMessage = { [messageSucces]: "No errors" };

        return resolve(resolveMessage);
      } catch (error) {
        const messageFailure = this.serverMessages.deleteTask.FAILURE;
        const rejectMessage = { [messageFailure]: error };

        return reject(rejectMessage);
      }
    });  
}

}