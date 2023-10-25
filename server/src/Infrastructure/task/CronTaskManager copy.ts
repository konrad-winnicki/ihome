import { TaskRepository } from "../../application/task/TaskRepository";
import { AppCron } from "../../domain/AppCron";
import { Task } from "../../domain/Task";
import { TaskManager } from "../../application/task/TaskManagerInterface";
import { ServerMessages } from "../../ServerMessages";

type ManagerResponse<T> = {
  [key: string]: T;
};

export class CronTaskManager implements TaskManager {
  private appCron: AppCron;
  private delegate: TaskManager;
  private taskRepository: TaskRepository;
  private serverMessages: ServerMessages;

  constructor(
    delegate: TaskManager,
    taskRepository: TaskRepository,
    appCron: AppCron,
    serverMessages: ServerMessages
  ) {
    this.delegate = delegate;
    this.taskRepository = taskRepository;
    this.appCron = appCron;
    this.serverMessages = serverMessages;
  }

  async add(task: Task): Promise<ManagerResponse<object | string>> {
    return this.delegate
      .add(task)
      .catch((error) => {
        return Promise.reject(error);
      })
      .then((addingCompleted) => {
        return this.taskRepository
          .findById(task.id)
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

  async delete(taskId: string): Promise<ManagerResponse<object | string>> {
    return this.appCron
      .deleteTask(taskId)
      .catch((error) => {
        const message = this.serverMessages.deleteTask.FAILURE;
        const rejectMessage = { [message]: error };
        Promise.reject(rejectMessage);
      })
      .then(() =>
        this.delegate
          .delete(taskId)
          .then((deletionCompleted) => Promise.resolve(deletionCompleted))
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
      .delete(taskId)
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
      .findById(taskId)
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
