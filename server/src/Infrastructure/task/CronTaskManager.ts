import { TaskScheduler } from "./TaskScheduler";
import { TaskManager } from "../../application/task/TaskManager";
import { ServerMessages } from "../../ServerMessages";

import { TaskRepository } from "../../application/task/TaskRepository";
import { Task } from "../../domain/Task";

type ManagerResponse<T> = {
  [key: string]: T;
};

export class CronTaskManager implements TaskManager {
  private appCron: TaskScheduler;
  private delegate: TaskRepository;
  private serverMessages: ServerMessages;

  constructor(
    appCron: TaskScheduler,
    delegate: TaskRepository,
    serverMessages: ServerMessages
  ) {
    this.appCron = appCron;
    this.delegate = delegate;
    this.serverMessages = serverMessages;
  }

  public async add(task: Task): Promise<ManagerResponse<object | string>> {
    return this.delegate
      .add(task)
      .then(() => {
        return this.appCron
          .add(
            task.id,
            Number(task.scheduledTime.minutes),
            Number(task.scheduledTime.hour),
            task.onStatus,
            task.deviceId
          )
          .catch((error) => {
            //const errorToPass = error instanceof Error ? error.message : error;
            return this.compensateTaskAddition(task.id)
              .catch((compensationError) => {
                const rejectMessage = {
                  Error: error,
                  compensation: compensationError,
                };
                console.log(rejectMessage);
                return Promise.reject(rejectMessage);
              })
              .then((compensationResult) => {
                const rejectMessage = {
                  Error: error,
                  compensation: compensationResult,
                };
                console.log(rejectMessage);
                return Promise.reject(rejectMessage);
              });
          });
      })
      .catch((error) => {
        const message = this.serverMessages.addTask.FAILURE;
        const rejectMessage = { [message]: error };
        return Promise.reject(rejectMessage);
      });
  }

  //TODO czy findBy Id powinno byc w interface CronTask Managera?
  public async delete(
    taskId: string
  ): Promise<ManagerResponse<object | string>> {
    return this.delegate
      .findById(taskId)
      .then((task) => this.deleteTask(task))
      .catch((delegateError) => {
        const messageFailure = this.serverMessages.deleteTask.FAILURE;
        return Promise.reject({ [messageFailure]: delegateError });
      });
  }

  public async listAll(): Promise<Task[]> {
    return this.delegate.listAll();
  }

  public async getByDevice(deviceId: string): Promise<Task[]> {
    return this.delegate.getByDevice(deviceId);
  }

  private async deleteTask(task: Task) {
    return this.delegate.delete(task.id).then(() => {
      return this.appCron.delete(task.id).catch((cronError) =>
        this.compensateTaskDeletion(task)
          .then((compensationResult) => {
            const rejectMessage = {
              error: cronError,
              compensation: compensationResult,
            };
            return Promise.reject(rejectMessage);
          })
          .catch((compensationError) => {
            const rejectMessage = {
              error: cronError,
              compensation: compensationError,
            };
            return Promise.reject(rejectMessage);
          })
      );
    });
  }

  private async compensateTaskAddition(taskId: string) {
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

  private async compensateTaskDeletion(task: Task) {
    return this.delegate
      .add(task)
      .then((response) => {
        const messageSuccess = this.serverMessages.compensation.SUCCESS;
        const resolveMessage = {
          [messageSuccess]: response,
        };
        console.log(resolveMessage);
        return Promise.resolve(resolveMessage);
      })
      .catch((err) => {
        const messageFailure = this.serverMessages.compensation.FAILURE;
        const rejectMessage = { [messageFailure]: err };

        console.log(rejectMessage);
        return Promise.reject(rejectMessage);
      });
  }
}
