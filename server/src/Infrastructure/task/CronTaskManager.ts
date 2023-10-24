import { TaskRepositoryInterface } from "../../application/task/TaskRepositoryInterface";
import { AppCron } from "../../domain/AppCron";
import { Task } from "../../domain/Task";
import { TaskManagerInterface } from "../../application/task/TaskManagerInterface";
import { ServerMessages } from "../../ServerMessages";

type ManagerResponse<T> = {
  [key: string]: T;
};

export class CronTaskManager implements TaskManagerInterface {
  private appCron: AppCron;
  private delegate: TaskManagerInterface;
  private taskRepository: TaskRepositoryInterface;
  private serverMessages: ServerMessages;

  constructor(
    delegate: TaskManagerInterface,
    taskRepository: TaskRepositoryInterface,
    appCron: AppCron,
    serverMessages: ServerMessages
  ) {
    this.delegate = delegate;
    this.taskRepository = taskRepository;
    this.appCron = appCron;
    this.serverMessages = serverMessages;
  }

  async addTask(task: Task): Promise<ManagerResponse<object|string>> {
    return this.delegate
      .addTask(task)
      .catch((error) => {
        return Promise.reject(error);
      })
      .then((addingCompleted) => {
        return this.taskRepository
          .findTaskById(task.id)
          .then((aggregatedTask) => {
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
            return Promise.resolve(addingCompleted);
          })
          .catch((error) =>
            this.compensateTaskAdditionToDB(task.id)
              .catch((compensationError) => {
                const messageFailure = this.serverMessages.addTask.FAILURE;
                const rejectMessage = {
                  [messageFailure]: {
                    error: error,
                    compensationError: compensationError,
                  },
                };
                return Promise.reject(rejectMessage);
              })
              .then((compensationResult) => {
                const messageFailure = this.serverMessages.addTask.FAILURE;
                const rejectMessage = {
                  [messageFailure]: {
                    error: error,
                    compensationSucceded: compensationResult,
                  },
                };
                return Promise.reject(rejectMessage);
              })
          );
      });
  }

  async deleteTask(taskId: string): Promise<ManagerResponse<object|string>> {
    return this.appCron
      .deleteTask(taskId)
      .catch((error) => {
        const message = this.serverMessages.deleteTask.FAILURE;
        const rejectMessage = { [message]: error };
        Promise.reject(rejectMessage);
      })
      .then(() =>
        this.delegate
          .deleteTask(taskId)
          .then((deletionCompleted) => 
             Promise.resolve(deletionCompleted)
          )
          .catch((error) =>
            this.compensateTaskDeletionFromMemory(taskId)
              .catch((compensationError: ManagerResponse<object>) => {
                const messageFailure = this.serverMessages.deleteTask.FAILURE;
                const rejectMessage = {
                  [messageFailure]: {
                    error: error,
                    compensationError: compensationError,
                  },
                };
                return Promise.reject(rejectMessage);
              })
              .then((compensationResult: ManagerResponse<string>) => {
                const messageFailure = this.serverMessages.deleteTask.FAILURE;
                const rejectMessage = {
                  [messageFailure]: {
                    error: error,
                    compensationError: compensationResult,
                  },
                };
                return Promise.reject(rejectMessage);
              })
          )
      );
  }

  compensateTaskAdditionToDB(taskId: string) {
    return this.delegate
      .deleteTask(taskId)
      .then((response) => {
        const message = this.serverMessages.compensation.SUCCESS;
        const resolveMessage = { [message]: response };
        console.log(resolveMessage);
        return Promise.resolve(resolveMessage);
      })
      .catch((error) => {
        const message = this.serverMessages.compensation.FAILURE;
        const rejectionMessage = { [message]: error };
        console.log(rejectionMessage);
        return Promise.reject(rejectionMessage);
      });
  }

  compensateTaskDeletionFromMemory(taskId: string) {
    return this.taskRepository
      .findTaskById(taskId)
      .then((task) => {
        this.appCron.installTask(
          task.id,
          task.minutes,
          task.hour,
          task.onStatus
            ? task.commandOn
            : task.commandOff
            ? task.commandOff
            : ""
        );
        const message = this.serverMessages.compensation.SUCCESS;
        const resolveMessage = { [message]: "Task restored to cron" };
        console.log(resolveMessage);
        return Promise.resolve(resolveMessage);
      })
      .catch((err: ManagerResponse<object>) => {
        const message = this.serverMessages.compensation.FAILURE;
        const rejectMessage = { [message]: err };
        console.log(rejectMessage);
        return Promise.reject(rejectMessage);
      });
  }
}
