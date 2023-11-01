import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManager";
import { FileRepositoryHelpers } from "./auxilaryFunctions";
import { TaskRepository } from "../../application/task/TaskRepository";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";

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

  async add(task: Task): Promise<ManagerResponse<object | string>> {
    return this.helperMethods
      .readFile("tasks.json")
      .then((fileContent) => {
        const isTaskExisting = this.helperMethods.findById(
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
        console.log("write task error", error);
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
        const isExisting = this.helperMethods.findById(fileContent, id);
        if (!isExisting) {
          throw new Error(`Task ${id} does not exists.`);
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
        const messageFailure = this.serverMessages.addTask.FAILURE;
        if (error instanceof Error) {
          return Promise.reject({ [messageFailure]: error.message });
        }
        return Promise.reject({ [messageFailure]: error });
      });
  }

  async listAll(): Promise<AggregatedTask[]> {
    return this.helperMethods
      .readFile("tasks.json")
      .then((tasksFileContent) => {
        const tasks = Object.values(tasksFileContent) as Task[];
        return this.helperMethods
          .readFile("devices.json")
          .then((devicesFileContent) => {
            return tasks.map((task: Task) => {
              const device = devicesFileContent[task.deviceId];
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
      })
      .catch((error) =>
        Promise.reject({ ["Fetching all tasks failed due error"]: error })
      );
  }

  async getByDevice(deviceId: string): Promise<Task[]> {
    return this.helperMethods
      .readFile("tasks.json")
      .then((fileContent) => {
        const tasks = Object.values(fileContent) as Task[];
        const filteredTasks = tasks.filter((task) => {
          if (task.deviceId === deviceId) {
            return task;
          }
        });
        if (filteredTasks.length > 0) {
          return Promise.resolve(filteredTasks);
        }
        return Promise.reject({ error: "Tasks not found" });
      })
      .catch((error) => Promise.reject({ error: error }));
  }

  async findByIdAndAggregate(taskId: string): Promise<AggregatedTask> {
    return this.listAll()
      .then((aggregatedTasks: AggregatedTask[]) => {
        const task = aggregatedTasks.find((task) => {
          return task.id === taskId;
        });
        if (task) {
          return task;
        }
        return Promise.reject({ ["Wrong id"]: `Task not exists` });
      })
      .catch((error) => Promise.reject({ error: error }));
  }

  async findById(taskId: string): Promise<Task> {
    return this.helperMethods.readFile("tasks.json").then((fileContent) => {
      const task = fileContent[taskId];

      if (task) {
        return Promise.resolve(task);
      }
      return Promise.reject({ '["WrongId"]': `Task not exists` });
    });
  }
}
