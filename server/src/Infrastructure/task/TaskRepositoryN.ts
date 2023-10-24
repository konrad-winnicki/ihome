import { TaskRepositoryInterface } from "../../application/task/TaskRepositoryInterface";
import { Task } from "../../domain/Task";
import { Model } from "mongoose";
import { AggregatedTask } from "../../domain/AggregatedTask";

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


export class TaskRepository implements TaskRepositoryInterface {
  private taskDocument: Model<Task>;
  constructor(taskDocument: Model<Task>) {
    this.taskDocument = taskDocument;
  }


  async findTaskById(taskId: string): Promise<AggregatedTask> {
    return this.taskDocument
      .aggregate(taskAndDeviceAggregationPipeline(taskId))
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
        return Promise.reject({['Wrong id']:`Task not exists`});
      });
  }

  async findAllTask(): Promise<AggregatedTask[]> {
    return this.taskDocument
      .aggregate(taskAndDeviceAggregationPipeline())
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
        Promise.reject({["Fetching all tasks failed due error"]: error})
      );
  }

  async findTasksForDevice(deviceId: string): Promise<Task[]> {
    return this.taskDocument
      .find({ deviceId: deviceId })
      .then((tasks) => tasks)
      .catch((error) =>
        Promise.reject({["Fetching task for device failed due error"]: error})
      );
  }

}
