import { TaskRepository } from "../../application/task/TaskRepository";
import { Task } from "../../domain/Task";
import { Model } from "mongoose";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { RepositoryResponse } from "../../application/task/TaskRepository";
import { ServerMessages } from "../../ServerMessages";

const taskAndDeviceAggregationPipeline = (taskId?: string) => [
  taskId ? { $match: { id: taskId } } : { $match: {} },
  {
    $lookup: {
      from: "devices",
      localField: "deviceId",
      foreignField: "id",
      as: "device",
    },
  },
  { $unwind: "$device" },
  { $unwind: "$scheduledTime" },
  {
    $project: {
      id: 1,
      onStatus: 1,
      scheduledTime: 1,
      device: { commandOn: 1, commandOff: 1 },
    },
  },
];

export class MongoTaskRepository implements TaskRepository {
  private taskDocument: Model<Task>;
  private serverMessages: ServerMessages;

  constructor(taskDocument: Model<Task>, serverMessages: ServerMessages) {
    this.taskDocument = taskDocument;
    this.serverMessages = serverMessages;
  }

  public async add(task: Task): Promise<RepositoryResponse<object>> {
    const newTask = {
      id: task.id,
      deviceId: task.deviceId,
      onStatus: task.onStatus,
      scheduledTime: task.scheduledTime,
    };

    return this.taskDocument
      .create(newTask)

      .then((task) => {
        const message = this.serverMessages.addTask.SUCCESS;
        return Promise.resolve({ [message]: task.id });
      })
      .catch((error) => {
        const message = this.serverMessages.addTask.FAILURE;
        const rejectMessage = { [message]: error };
        return Promise.reject(rejectMessage);
      });
  }

  public async delete(taskId: string): Promise<RepositoryResponse<object>> {
    const messageSucces = this.serverMessages.deleteTask.SUCCESS;
    const messageFailure = this.serverMessages.deleteTask.FAILURE;
    return this.taskDocument
      .deleteOne({ id: taskId })
      .then((databaseResponse) => {
        const resolveMessage = { [messageSucces]: databaseResponse };
        const rejectMessage = { [messageFailure]: databaseResponse };

        return databaseResponse.acknowledged &&
          databaseResponse.deletedCount == 1
          ? Promise.resolve(resolveMessage)
          : Promise.reject(rejectMessage);
      })
      .catch((error) => {
        const rejectMessage = { [messageFailure]: error };

        return Promise.reject(rejectMessage);
      });
  }

  public async findByIdAndAggregateWithDevice(
    taskId: string
  ): Promise<AggregatedTask> {
    const persistenceError = this.serverMessages.persistenceError
    const notFound = this.serverMessages.notFound;

    return this.taskDocument
      .aggregate(taskAndDeviceAggregationPipeline(taskId))
      .then((aggregatedTasksList) => {
        if (aggregatedTasksList.length === 1) {
          const aggregatedTask = aggregatedTasksList[0];

          return Promise.resolve(
            new AggregatedTask(
              aggregatedTask.id,
              aggregatedTask.onStatus,
              aggregatedTask.scheduledTime.hour,
              aggregatedTask.scheduledTime.minutes,
              aggregatedTask.device.commandOn,
              aggregatedTask.device.commandOff
            )
          );
        }
        return Promise.reject({ [notFound]: `Task not exists` });
      }).catch((error)=> Promise.reject({[persistenceError]:error}) )
  }

  public async findById(taskId: string): Promise<Task> {
    const notFoundMessage = this.serverMessages.notFound;

    return this.taskDocument
      .findOne({ id: taskId })
      .then((task) => {
        if (task) {
          return Promise.resolve(
            new Task(task.id, task.deviceId, task.onStatus, task.scheduledTime)
          );
        } else {
          return Promise.reject(`Task not exists`);
        }
      })
      .catch((error) => {
        return Promise.reject({ [notFoundMessage]: error });
      });
  }

  public async listAll(): Promise<AggregatedTask[]> {
    const persistenceError = this.serverMessages.persistenceError;

    return this.taskDocument
      .aggregate(taskAndDeviceAggregationPipeline())
      .then((aggregatedTasks) => {
        const tasks = aggregatedTasks.map(
          (task) =>
            new AggregatedTask(
              task.id,
              task.onStatus,
              task.scheduledTime.hour,
              task.scheduledTime.minutes,
              task.device.commandOn,
              task.device.commandOff
            )
        );
        return Promise.resolve(tasks);
      })
      .catch((error) => Promise.reject({ [persistenceError]: error }));
  }

  public async getByDevice(deviceId: string): Promise<Task[]> {
    const databaseError = this.serverMessages.persistenceError;

    return this.taskDocument
      .find({ deviceId: deviceId })
      .then((tasks) => tasks)
      .catch((error) => Promise.reject({ [databaseError]: error }));
  }
}
