import { DBTaskInterface } from "../../application/task/DBTaskInterface";
import { AppCron } from "../../domain/AppCron";
import { Task } from "../../domain/Task";
import { AggregatedTask } from "../../domain/AggregatedTask";
import cron from "node-cron";
import { CronTaskInterface } from "../../application/task/CronTaskInterface";

//const appCron = new AppCron();

export class CronTaskManager implements CronTaskInterface {
  private appCron: AppCron;
  private delegate: DBTaskInterface;

  constructor(delegate: DBTaskInterface, appCron: AppCron) {
    this.delegate = delegate;
    this.appCron = appCron;
  }

  async transformTaskFromDbToCron() {
    try {
      const tasks = await this.findAllTask();
      tasks?.forEach((task: AggregatedTask) => {
        this.appCron.installTask(
          task.id,
          task.minutes,
          task.hour,
          task.onStatus
            ? task.commandOn
            : task.commandOff
            ? task.commandOff
            : ""
        );
      });

      const crontask = cron.getTasks();
      console.log("crontasks:", crontask);
      return "id";
    } catch (err) {
      console.log("cronarror:", err);
      return null;
    }
  }

  async addTask(task: Task): Promise<string> {
    try {
      await this.delegate.addTask(task);
      const aggreatedTask = await this.findTaskById(task.id);
      if (aggreatedTask) {
        try {
          this.appCron.installTask(
            aggreatedTask.id,
            aggreatedTask.minutes,
            aggreatedTask.hour,
            aggreatedTask.onStatus
              ? aggreatedTask.commandOn
              : aggreatedTask.commandOff
              ? aggreatedTask.commandOff
              : ""
          );
          const tasks = cron.getTasks();
          console.log("CRON", tasks);
          return Promise.resolve("Succes");
        } catch (err) {
          this.delegate.deleteTask(task.id);
          return Promise.reject(`Task not aded to cron due error: ${err}`);
        }
      }
      return Promise.reject(`Task with id ${task.id} is not in database `);
    } catch (err) {
      return Promise.reject(`Task not aded to cron due error: ${err}`);
    }
  }
  async findTaskById(taskId: string): Promise<AggregatedTask | null> {
    return await this.delegate.findTaskById(taskId);
  }
  async findAllTask(): Promise<AggregatedTask[] | null> {
    return await this.delegate.findAllTask();
  }

  async findTasksForDevice(deviceId: string): Promise<Task[] | null> {
    return await this.delegate.findTasksForDevice(deviceId);
  }

  /*
  async handleEvent(msg: string) {
    console.log("event msg", msg, typeof msg);
    console.log("task before deletion", cron.getTasks());

    const tasks = await this.taskDocument.find({ deviceId: msg });
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

  */

  async deleteTask(taskId: string): Promise<string> {
    try {
      await this.delegate.deleteTask(taskId);
      const taskmap = cron.getTasks();
      taskmap.delete(taskId);
      console.log("task after deletio:", cron.getTasks());
      return Promise.resolve("Success");
    } catch (err) {
      console.log(err);
      return Promise.resolve(`Deletion ended with err:${err}`);
    }
  }
}
