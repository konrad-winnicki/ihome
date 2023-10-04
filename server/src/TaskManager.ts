import { TaskInterface } from "./TaskInterface";
import { AppCron } from "./cron";
import { Task } from "./domain/Task";
import { Model, mongo } from "mongoose";
import { AggregatedTask } from "./domain/AggregatedTask";
import cron from "node-cron";

//const appCron = new AppCron();

export class TaskManager implements TaskInterface {
  private appCron: AppCron;
  private taskDocument: Model<Task>;
  constructor(taskDocument: Model<Task>, appCron: AppCron) {
    this.taskDocument = taskDocument;
    this.appCron = appCron;
  }

  async addTaskToDB(task: Task): Promise<string> {
    const newTask = {
      id: task.id,
      deviceId: task.deviceId,
      onStatus: task.onStatus,
      scheduledTime: task.scheduledTime,
    };
    try {
      const taskFromDB = await this.taskDocument.create(newTask);
      if (taskFromDB) {
        const aggreatedTask = await this.findTaskById(taskFromDB.id);
        if (aggreatedTask) {
          try {
            this.addTaskToCron(aggreatedTask);
            const tasks = cron.getTasks();
            console.log("CRON", tasks);
          } catch (err) {
            this.taskDocument.findByIdAndRemove(taskFromDB.id);
            throw err;
          }
        }
      }

      return taskFromDB.id;
    } catch (err) {
      if (err instanceof mongo.MongoServerError) {
        this.uniqueViolationErrorHandler(err);
      }
      throw err;
    }
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("email")) {
      throw new Error("EmailConflictError");
    }
    if (isUniqueViolation && err.errmsg.includes("name")) {
      throw new Error("NameConflictError");
    }
    throw err;
  }

  async findTaskById(taskId: string): Promise<AggregatedTask | null> {
    /*
  const task = await this.taskDocument.findOne({ id: taskId}).populate({
    path: 'deviceId',
    model: mongoose.model("Switch", SwitchSchema),
    select: 'id',
    //foreignField: "id"
  })
  */
    ////

    const aggregatedTaskArrayFromDb = await this.taskDocument.aggregate([
      { $match: { id: taskId } },
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
    ]);
    console.log("aggregated", aggregatedTaskArrayFromDb);

    if (aggregatedTaskArrayFromDb.length > 0) {
      const aggregatedTaskFromDb = aggregatedTaskArrayFromDb[0];
      const aggregatedTask = new AggregatedTask(
        aggregatedTaskFromDb.id,
        aggregatedTaskFromDb.onStatus,
        aggregatedTaskFromDb.scheduledTime.hour,
        aggregatedTaskFromDb.scheduledTime.minutes,
        aggregatedTaskFromDb.device.commandOn,
        aggregatedTaskFromDb.device.commandOff
      );
      console.log(aggregatedTask);
      return aggregatedTask;
    } else {
      return null;
    }
  }

  async findAllTask(): Promise<AggregatedTask[] | null> {
    const aggregatedTaskArrayFromDb = await this.taskDocument.aggregate([
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
    ]);

    if (aggregatedTaskArrayFromDb.length > 0) {
      return aggregatedTaskArrayFromDb.map((aggregatedTask) => {
        return new AggregatedTask(
          aggregatedTask.id,
          aggregatedTask.onStatus,
          aggregatedTask.scheduledTime.hour,
          aggregatedTask.scheduledTime.minutes,
          aggregatedTask.device.commandOn,
          aggregatedTask.device.commandOff
        );
      });
    } else {
      return null;
    }
  }

  async findTasksForDevice(deviceId: string): Promise<Task[] | null> {
    console.log(deviceId);
    try {
      const tasks = await this.taskDocument.find({ deviceId: deviceId });
      return tasks;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async deleteTaskFromDB(taskId: string): Promise<boolean> {
    try {
      const taskmap = cron.getTasks();
      taskmap.delete(taskId);
    } catch (err) {
      console.log(err);
      return false;
    }
    const isExistingTask = cron.getTasks().get(taskId);
    console.log("TASKMAP", cron.getTasks());
    if (!isExistingTask) {
      try {
        const tasks = await this.taskDocument.deleteOne({ id: taskId });
        const result = tasks.acknowledged;

        console.log("deletion result", result);
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
    return false;
  }

  addTaskToCron(task: AggregatedTask) {
    try {
      this.appCron.installTask(
        task.id,
        task.minutes,
        task.hour,
        task.onStatus ? task.commandOn : task.commandOff ? task.commandOff : ""
      );
      const crontask = cron.getTasks();
      console.log("crontasks:", crontask);
      return task.id;
    } catch (err) {
      console.log("cronarror:", err);
      return null;
    }
  }
}
