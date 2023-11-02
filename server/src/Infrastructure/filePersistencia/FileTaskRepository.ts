import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManager";
import { FileRepositoryHelpers } from "./auxilaryFunctions";
import { TaskRepository } from "../../application/task/TaskRepository";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";
import { Meter } from "../../domain/Meter";
import { Switch } from "../../domain/Switch";

export class FileTaskRepository implements TaskRepository {
  private helperMethods: FileRepositoryHelpers;
  private serverMessages: ServerMessages;

  constructor(
    helperMethods: FileRepositoryHelpers,
    serverMessages: ServerMessages
  ) {
    this.helperMethods = helperMethods;
    this.serverMessages = serverMessages;
  }

  async add(task: Task): Promise<ManagerResponse<object|string>> {
    return this.helperMethods
      .readFile("tasks.json")
      .then((fileContent) => {
        const isTaskExisting = this.helperMethods.findByIdInFile(
          fileContent,
          task.id
        );
        if (isTaskExisting) {
          Promise.reject({
            error: this.serverMessages.uniqueViolation.ID_DUPLICATION,
          });
        }

        fileContent[task.id] = task;

        return this.helperMethods
          .writeFile("tasks.json", fileContent)
          .then(() => {
            const messageSuccess = this.serverMessages.addTask.SUCCESS;
            const resolveMessage = { [messageSuccess]: task.id };
            return Promise.resolve(resolveMessage);
          });
      })
      .catch((error) => {
        const messageFailure = this.serverMessages.addTask.FAILURE;
        if (error instanceof Error) {
          return Promise.reject({ [messageFailure]: error.message });
        }
        return Promise.reject({ [messageFailure]: error });
      });
  }

  async delete(id: string): Promise<ManagerResponse<string>> {
    return this.helperMethods
      .readFile("tasks.json")
      .then((fileContent) => {
        const isExisting = this.helperMethods.findByIdInFile(fileContent, id);
        if (!isExisting) {
          const notFoundError= this.serverMessages.notFound

          return Promise.reject({[notFoundError]: `Task ${id} does not exists.`});
        }
        delete fileContent[id];

        return this.helperMethods
          .writeFile("tasks.json", fileContent)
          .then(() => {
            const messageSuccess = this.serverMessages.deleteTask.SUCCESS;
            const resolveMessage = { [messageSuccess]: "No errors" };
            return Promise.resolve(resolveMessage);
          });
      })
      .catch((error) => {
        const messageFailure = this.serverMessages.deleteTask.FAILURE;
        if (error instanceof Error) {
          return Promise.reject({ [messageFailure]: error.message });
        }
        return Promise.reject({ [messageFailure]: error });
      });
  }

  async listAll(): Promise<AggregatedTask[]> {
    return this.helperMethods.readFile("tasks.json").then((taskMap) => {
      const tasks = Object.values(taskMap) as Task[];
      return this.helperMethods.readFile("devices.json").then((deviceMap) => {
        return tasks.map((task: Task) => {
          const device = (deviceMap[task.deviceId]) as Meter & Switch
          return new AggregatedTask(
            task.id,
            task.onStatus,
            Number(task.scheduledTime.hour),
            Number(task.scheduledTime.minutes),
            device.commandOn,
            device.commandOff
          );
        });
      });
    });
  }

  async getByDevice(deviceId: string): Promise<Task[]> {
    const notFoundError = this.serverMessages.notFound;
    const persistenceError = this.serverMessages.persistenceError

    return this.helperMethods.readFile("tasks.json").then((taskMap) => {
      const tasks = Object.values(taskMap) as Task[];
      const tasksFilteredById = tasks.filter((task) => {
        if (task.deviceId === deviceId) {
          return task;
        }
      });
      if (tasksFilteredById.length > 0) {
        return Promise.resolve(tasksFilteredById);
      }
      return Promise.reject({ [notFoundError]: "No task for this device" });
    }).catch((error)=> Promise.reject({[persistenceError]:error}) )
  }

  async findByIdAndAggregateWithDevice(
    taskId: string
  ): Promise<AggregatedTask> {
    const notFoundMessage = this.serverMessages.notFound;
    const persistenceError = this.serverMessages.persistenceError

    return this.listAll().then((aggregatedTasks: AggregatedTask[]) => {
      const task = aggregatedTasks.find((aggregatedTaskl) => {
        return aggregatedTaskl.id === taskId;
      });
      if (task) {
        return task;
      }
      return Promise.reject({ [notFoundMessage]: `Task not exists` });
    }).catch((error)=> Promise.reject({[persistenceError]:error}) )
  }

  async findById(taskId: string): Promise<Task> {
    const notFoundMessage = this.serverMessages.notFound;

    return this.helperMethods.readFile("tasks.json").then((tasks) => {
      const task = tasks[taskId];

      if (task) {
        return Promise.resolve(task as Task);
      }
      return Promise.reject(`Task not exists`);
    }).catch((error) => {
      return Promise.reject({ [notFoundMessage]: error });
    });
  }
}
