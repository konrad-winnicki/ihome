import { DBTaskInterface } from "../../application/task/DBTaskInterface";
import { Task } from "../../domain/Task";
import { AggregatedTask } from "../../domain/AggregatedTask";
import EventEmitter from "node:events";
import cron from "node-cron";
import { database } from "../../server";
import { CronTaskInterface } from "../../application/task/CronTaskInterface";

//const appCron = new AppCron();

export class TaskManager implements DBTaskInterface, CronTaskInterface {
  delegate: DBTaskInterface & CronTaskInterface;
  constructor(
    delegate: DBTaskInterface & CronTaskInterface,
    eventEmitter: EventEmitter
  ) {
    this.handleEvent = this.handleEvent.bind(this);
    eventEmitter.on("deviceDeleted", this.handleEvent);
    this.delegate = delegate;
  }

  async addTask(task: Task): Promise<string> {
    return this.delegate.addTask(task);
  }

  async findTaskById(taskId: string): Promise<AggregatedTask | null> {
    return this.delegate.findTaskById(taskId);
  }

  async findAllTask(): Promise<AggregatedTask[] | null> {
    return this.delegate.findAllTask();
  }

  async findTasksForDevice(deviceId: string): Promise<Task[] | null> {
    return this.delegate.findTasksForDevice(deviceId);
  }

  async handleEvent(msg: string) {
    console.log("event msg", msg, typeof msg);
    console.log("task before deletion", cron.getTasks());

    const tasks = await this.findTasksForDevice(msg);
    tasks?.forEach((task: Task) => cron.getTasks().delete(task.id));
    const session = await database.connection.startSession();
    session.startTransaction();
    try {
      tasks?.forEach(async (task: Task) => await this.deleteTask(task.id));
      await session.commitTransaction();
    } catch (err) {
      this.transformTaskFromDbToCron();
      await session.abortTransaction();
      session.endSession();
    }

    console.log("task after deletion", cron.getTasks());
  }

  async deleteTask(taskId: string): Promise<string> {
    return this.delegate.deleteTask(taskId);
  }

  transformTaskFromDbToCron() {
    return this.delegate.transformTaskFromDbToCron();
  }
}
