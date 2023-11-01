import { AppCron } from "../../domain/AppCron";
import { TaskManager } from "../../application/task/TaskManager";
import { ServerMessages } from "../../ServerMessages";

import { TaskRepository } from "../../application/task/TaskRepository";
import { Task } from "../../domain/Task";
import { AggregatedTask } from "../../domain/AggregatedTask";

type ManagerResponse<T> = {
  [key: string]: T;
};

export class CronTaskManager implements TaskManager {
  private appCron: AppCron;
  private delegate: TaskRepository;
  private serverMessages: ServerMessages;

  constructor(
    appCron: AppCron,
    delegate: TaskRepository,
    serverMessages: ServerMessages
  ) {
    this.appCron = appCron;
    this.delegate = delegate;
    this.serverMessages = serverMessages;
  }

  async add(task: Task): Promise<ManagerResponse<object | string>> {
    return this.delegate
      .add(task)
      .then((response) => {
        const taskId = (response as { [taskId: string]: string }).taskId;
        return this.delegate
          .findByIdAndAggregate(taskId)
          .then((aggregatedTask) => {
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
              .catch((delegateError) => {
                return this.compensateTaskAddition(task.id)
                  .catch((compensationError) => {
                    const rejectMessage = {
                      Error: delegateError,
                      compensation: compensationError,
                    };
                    console.log(rejectMessage);
                    return Promise.reject(rejectMessage);
                  })
                  .then((compensationResult) => {
                    const rejectMessage = {
                      Error: delegateError,
                      compensation: compensationResult,
                    };
                    console.log(rejectMessage);
                    return Promise.reject(rejectMessage);
                  });
              });
          });
      })
      .catch((error) => {
        const message = this.serverMessages.addTask.FAILURE;
        const rejectMessage = { [message]: error };
        return Promise.reject(rejectMessage);
      });
  }

  async delete(taskId: string): Promise<ManagerResponse<object | string>> {
    return this.delegate
      .findById(taskId)
      .then((task) => this.deleteTask(task))
      .catch((error) => {
        console.log("ERRRRRRRRR", error);
        const messageFailure = this.serverMessages.deleteTask.FAILURE;
        return Promise.reject({ [messageFailure]: error });
      });
  }

  async listAll(): Promise<AggregatedTask[]> {
    return this.delegate.listAll();
  }

  async deleteTask(task: Task) {
    return this.delegate.delete(task.id).then(() => {
      return this.appCron.deleteTask(task.id).catch((cronError) =>
        this.compensateTaskDeletion(task)
          .then((compensationResult: ManagerResponse<object | string>) => {
            const rejectMessage = {
              error: cronError,
              compensation: compensationResult,
            };
            return Promise.reject(rejectMessage);
          })
          .catch((compensationError: ManagerResponse<object | string>) => {
            const rejectMessage = {
              error: cronError,
              compensation: compensationError,
            };
            return Promise.reject(rejectMessage);
          })
      );
    });
  }

  async getByDevice(deviceId: string): Promise<Task[]> {
    return this.delegate.getByDevice(deviceId);
  }

  async compensateTaskAddition(taskId: string) {
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

  async compensateTaskDeletion(task: Task) {
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
