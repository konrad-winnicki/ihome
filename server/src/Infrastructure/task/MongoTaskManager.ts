import { DBTaskInterface } from "../../application/task/DBTaskInterface";
import { Task } from "../../domain/Task";
import { Model, mongo } from "mongoose";
import { AggregatedTask } from "../../domain/AggregatedTask";
import cron from "node-cron";
import { database, fillCronInMemoryWithData } from "../../server";

//const appCron = new AppCron();

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
    try {
      const taskFromDB = await this.taskDocument.create(newTask);
      return Promise.resolve(taskFromDB.id);
    } catch (err) {
      if (err instanceof mongo.MongoServerError) {
        this.uniqueViolationErrorHandler(err);
        return Promise.reject(`Task not added due to error: ${err}`);
      }
      return Promise.reject(`Task not added due to error: ${err}`);
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

  async handleEvent(deviceId: string) {
    const tasks = await this.taskDocument.find({ deviceId: deviceId });
    tasks.forEach((task: Task) => cron.getTasks().delete(task.id));
    const session = await database.connection.startSession();
    session.startTransaction();
    try {
      tasks.forEach(
        async (task: Task) => await this.taskDocument.deleteOne({ id: task.id })
      );
      await session.commitTransaction();
    } catch (err) {
      fillCronInMemoryWithData();
      await session.abortTransaction();
      session.endSession();
    }

    console.log("task after deletion", cron.getTasks());
  }

  async deleteTask(taskId: string): Promise<string> {
    try {
      const tasks = await this.taskDocument.deleteOne({ id: taskId });
      const result = tasks.acknowledged;

      console.log("deletion result", result);
      return Promise.resolve("Success");
    } catch (err) {
      console.log(err);
      return Promise.reject(`Task not deleted due to error: ${err}`);
    }
  }

  /*
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

  */
}
