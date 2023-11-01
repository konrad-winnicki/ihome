import { DeviceService } from "../device/DeviceService";
import { TaskManager } from "./TaskManager";
import { TaskRepository } from "./TaskRepository";
import { Task } from "../../domain/Task";
import { ServerMessages } from "../../ServerMessages";
import EventEmitter from "node:events";

type ManagerResponse<T> = {
  [key: string]: T;
};

export class TaskService {
  private taskRepository: TaskRepository;
  private taskManager: TaskManager;
  private dviceService: DeviceService;

  private serverMessages: ServerMessages;

  constructor(
    taskRepository: TaskRepository,
    taskManager: TaskManager,
    deviceService: DeviceService,
    serverMessages: ServerMessages,
    eventEmitter: EventEmitter
  ) {
    this.taskRepository = taskRepository;
    this.taskManager = taskManager;
    this.dviceService = deviceService;
    this.serverMessages = serverMessages;
    this.handleEvent = this.handleEvent.bind(this);
    eventEmitter.on("deviceDeleted", this.handleEvent);
  }

  async add(task: Task): Promise<ManagerResponse<object | string>> {
    return this.dviceService
      .getById(task.deviceId)
      .catch((error: ManagerResponse<object | string>) => Promise.reject(error))
      .then(() =>
        this.taskRepository
          .add(task)
          .catch((error) => {
            return Promise.reject(error);
          })
          .then(() => {
            return this.taskRepository
              .findById(task.id)
              .then((aggregatedTask) => {
                return this.taskManager
                  .add(aggregatedTask)
                  .then((response) => {
                    console.log('response',response)
                    return Promise.resolve(response)})
                  .catch((error) => Promise.reject(error))
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
          })
      );
  }

  async delete(taskId: string): Promise<ManagerResponse<object | string>> {
    return this.taskManager
      .delete(taskId)
      .catch((error) => {
        console.log("taskservice", error);
        return Promise.reject(error);
      })
      .then(() =>
        this.taskRepository
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

  async compensateTaskAdditionToDB(taskId: string) {
    return this.taskRepository
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

  async compensateTaskDeletionFromMemory(taskId: string) {
    return this.taskRepository
      .findById(taskId)
      .then((aggregatedTask) => {
        this.taskManager.add(aggregatedTask);
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

  async getByDevice(deviceId: string): Promise<Task[]> {
    return this.taskRepository.getByDevice(deviceId);
  }
}
