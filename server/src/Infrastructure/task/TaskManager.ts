import { DBTaskInterface } from "../../application/task/DBTaskInterface";
import { Task } from "../../domain/Task";
import { AggregatedTask } from "../../domain/AggregatedTask";
import EventEmitter from "node:events";
import cron from "node-cron";
import { CronTaskInterface } from "../../application/task/CronTaskInterface";


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

  async findTaskById(taskId: string): Promise<AggregatedTask> {
    return this.delegate.findTaskById(taskId);
  }

  async findAllTask(): Promise<AggregatedTask[]> {
    return this.delegate.findAllTask();
  }

  async findTasksForDevice(deviceId: string): Promise<Task[]> {
    return this.delegate.findTasksForDevice(deviceId);
  }

  async handleEvent(deviceId: string) {
    //TODO what if device deleted but task failed?

   await this.findTasksForDevice(deviceId)
      .then((tasks) => {
        Promise.all([
          tasks.map((task) => {
            this.deleteTask(task.id)
              .then((result) => Promise.resolve(result))
              .catch((error) => Promise.reject(error));
          }),
        ])
          .then((result) => console.log(result))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
    /*
    const tasks = await this.findTasksForDevice(deviceId);
    const session = await database.connection.startSession();
    session.startTransaction();
    try {
      tasks.forEach(async (task: Task) => {
        try {
          await this.deleteTask(task.id);
        } catch (err) {
          console.log(err);
        }
      });

      await session.commitTransaction();
    } catch (err) {
      this.transformTaskFromDbToCron();
      await session.abortTransaction();
      session.endSession();
    }
*/
    console.log("task after deletion", cron.getTasks());
  }

  async deleteTask(taskId: string): Promise<string> {
    return this.delegate.deleteTask(taskId);
  }

  async transformTaskFromDbToCron() {
    return this.delegate.transformTaskFromDbToCron();
  }
}
