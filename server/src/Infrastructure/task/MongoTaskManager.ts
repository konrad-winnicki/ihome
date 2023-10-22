import { TaskRepository } from "../../application/task/TaskRepository";
import { Task } from "../../domain/Task";
import { Model } from "mongoose";
import { AggregatedTask } from "../../domain/AggregatedTask";

export const taskDeviceAggregationPipeline = (taskId?: string) => [
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

export class MongoTaskManager implements TaskRepository {
  private taskDocument: Model<Task>;

  constructor(taskDocument: Model<Task>) {
    this.taskDocument = taskDocument;
  }

  async addTask(task: Task): Promise<string> {
    const newTask = {
      id: task.id,
      deviceId: task.deviceId,
      onStatus: task.onStatus,
      scheduledTime: task.scheduledTime,
    };

    return this.taskDocument
      .create(newTask)
      .then((task) => Promise.resolve(task.id))
      .catch((error) =>
        Promise.reject(`Task not added due to error: ${error}`)
      );
  }

  async findTaskById(taskId: string): Promise<AggregatedTask> {
    //TODO: try with populate
    return this.taskDocument
      .aggregate(taskDeviceAggregationPipeline(taskId))
      .then((aggregatedTasksList) => {
        if (aggregatedTasksList.length === 1) {
          const aggregatedTask = aggregatedTasksList[0];

          return new AggregatedTask(
            aggregatedTask.id,
            aggregatedTask.onStatus,
            aggregatedTask.scheduledTime.hour,
            aggregatedTask.scheduledTime.minutes,
            aggregatedTask.device.commandOn,
            aggregatedTask.device.commandOff
          );
        }
        return Promise.reject(`Task with ${taskId} not exists`);
      });
  }

  async findAllTask(): Promise<AggregatedTask[]> {
    return this.taskDocument
      .aggregate(taskDeviceAggregationPipeline())
      .then((aggregatedTasks) =>
        aggregatedTasks.map(
          (task) =>
            new AggregatedTask(
              task.id,
              task.onStatus,
              task.scheduledTime.hour,
              task.scheduledTime.minutes,
              task.device.commandOn,
              task.device.commandOff
            )
        )
      )
      .catch((error) =>
        Promise.reject(`Fetching all tasks failed due error: ${error}`)
      );
  }

  async findTasksForDevice(deviceId: string): Promise<Task[]> {
    return this.taskDocument
      .find({ deviceId: deviceId })
      .then((tasks) => tasks)
      .catch((error) =>
        Promise.reject(`Fetching task for device failed due error: ${error}`)
      );
  }

  async deleteTask(taskId: string): Promise<string> {
    return this.taskDocument
      .deleteOne({ id: taskId })
      .then((response) =>
        response.acknowledged && response.deletedCount == 1
          ? Promise.resolve(`Task ${taskId} deleted`)
          : Promise.reject(`Task with ${taskId} not exists`)
      )
      .catch((error) =>
        Promise.reject(`Task not deleted due database error: ${error}`)
      );
  }
}
