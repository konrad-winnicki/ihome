import { DBTaskInterface } from "../../application/task/DBTaskInterface";
import { Task } from "../../domain/Task";
import { Model } from "mongoose";
import { AggregatedTask } from "../../domain/AggregatedTask";

const taskDeviceAggregationPipeline = (taskId?: string) => [
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

export class MongoTaskManager implements DBTaskInterface {
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
      .then((task) => Promise.resolve(`Task ${task.id} added`))
      .catch((error) =>
        Promise.reject(`Task not added due to error: ${error}`)
      );
  }

  async findTaskById(taskId: string): Promise<AggregatedTask> {
    //TODO: try with populate
    return this.taskDocument
      .aggregate(taskDeviceAggregationPipeline(taskId))
      .then((aggregatedTasksList) => {
        const aggregatedTask = aggregatedTasksList[0];
        return new AggregatedTask(
          aggregatedTask.id,
          aggregatedTask.onStatus,
          aggregatedTask.scheduledTime.hour,
          aggregatedTask.scheduledTime.minutes,
          aggregatedTask.commandOn,
          aggregatedTask.commandOff
        );
      })
      .catch((error) =>
        Promise.reject(`Fetching all tasks failed due error: ${error}`)
      );

  }

  async findAllTask(): Promise<AggregatedTask[]> {
    return this.taskDocument
      .aggregate(taskDeviceAggregationPipeline())
      .then((aggregatedTasks) => {
        return aggregatedTasks.map((aggregatedTask) => {
          return new AggregatedTask(
            aggregatedTask.id,
            aggregatedTask.onStatus,
            aggregatedTask.scheduledTime.hour,
            aggregatedTask.scheduledTime.minutes,
            aggregatedTask.device.commandOn,
            aggregatedTask.device.commandOff
          );
        });
      })
      .catch((error) =>
        Promise.reject(`Fetching all tasks failed due error: ${error}`)
      );
    //dlaczego jak nie zrobie promise reject promise resolve with passed error string
    //dlaczego jak mma promise rejected tyoescript dont show error that not return task list
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
    //TODO: issue with "taskId" to analyse
    return this.taskDocument
      .deleteOne({ id: taskId })
      .then((response) => {
        if (response.acknowledged) {
          return Promise.resolve(`Task ${taskId} deleted`);
        }
        return Promise.reject(`Task not deleted`);
      })
      .catch((error) => Promise.reject(`Task not deleted due error: ${error}`));
  }

}
