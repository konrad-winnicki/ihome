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

  async add(task: Task): Promise<RepositoryResponse<object>> {
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

  async delete(taskId: string): Promise<RepositoryResponse<object>> {
    return this.taskDocument
      .deleteOne({ id: taskId })
      .then((response) => {
        const messageSucces = this.serverMessages.deleteTask.SUCCESS;
        const messageFailure = this.serverMessages.deleteTask.FAILURE;
        const resolveMessage = { [messageSucces]: response };
        const rejectMessage = { [messageFailure]: response };

        return response.acknowledged && response.deletedCount == 1
          ? Promise.resolve(resolveMessage)
          : Promise.reject(rejectMessage);
      })
      .catch((error) => {
        const messageFailure = this.serverMessages.deleteTask.FAILURE;
        const rejectMessage = { [messageFailure]: error };

        return Promise.reject(rejectMessage);
      });
  }

  async findByIdAndAggregate(taskId: string): Promise<AggregatedTask> {
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
        return Promise.reject({ ["Wrong id"]: `Task not exists` });
      });
  }

  async findById(taskId: string): Promise<Task> {
    return this.taskDocument.findOne({ id: taskId }).then((task) => {
      if (task) {
        return Promise.resolve(
          new Task(task.id, task.deviceId, task.onStatus, task.scheduledTime)
        );
      } else {
        return Promise.reject({ '["WrongId"]': `Task not exists` });
      }
    });
  }
  async listAll(): Promise<AggregatedTask[]> {
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
      .catch((error) =>
        Promise.reject({ ["Fetching all tasks failed due error"]: error })
      );
  }

  async getByDevice(deviceId: string): Promise<Task[]> {
    return this.taskDocument
      .find({ deviceId: deviceId })
      .then((tasks) => tasks)
      .catch((error) =>
        Promise.reject({ ["Fetching task for device failed due error"]: error })
      );
  }
}
