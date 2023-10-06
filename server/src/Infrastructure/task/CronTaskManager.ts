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
    return this.findAllTask()
      .then((tasks) => {
        tasks.forEach((task: AggregatedTask) => {
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
        return Promise.resolve("Task transfered from database to cron");
      })
      .catch((error) =>
        Promise.reject(`Task not transfered to cron due error: ${error}`)
      );
  }

  async addTask(task: Task): Promise<string> {
    return this.delegate
      .addTask(task)
      .catch((error) => Promise.reject(error))
      .then((response) => {
        return this.findTaskById(task.id)
          .catch(() => Promise.reject(`Task not added`))
          .then((aggregatedTask) => {
            this.appCron.installTask(
              aggregatedTask.id,
              aggregatedTask.minutes,
              aggregatedTask.hour,
              aggregatedTask.onStatus
                ? aggregatedTask.commandOn
                : aggregatedTask.commandOff
                ? aggregatedTask.commandOff
                : ""
            );
            console.log("ACTUAL TASK", cron.getTasks());
            return Promise.resolve(response);
          });
      });
    /*
    try {
      await this.delegate.addTask(task);
      const aggreatedTask = await this.findTaskById(task.id);
      console.log('AGGGRE', aggreatedTask)
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
          )
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
    */
  }
  async findTaskById(taskId: string): Promise<AggregatedTask> {
    return await this.delegate.findTaskById(taskId);
  }
  async findAllTask(): Promise<AggregatedTask[]> {
    return await this.delegate.findAllTask();
  }

  async findTasksForDevice(deviceId: string): Promise<Task[]> {
    return this.delegate.findTasksForDevice(deviceId);
  }

  async deleteTask(taskId: string): Promise<string> {
    const memoryTaskList = cron.getTasks();
    const isDeletedFromMemory = memoryTaskList.delete(taskId);

    if (isDeletedFromMemory) {
      return this.delegate
        .deleteTask(taskId)
        .then((response) => response)
        .catch((error) =>
          this.compensateTaskDeletionFromMemory(taskId)
            .then(() =>
              Promise.reject(`Task deletion failed de to error ${error}`)
            )
            .catch(() =>
              Promise.reject(`Task deletion failed de to error ${error}`)
            )
        );
    } else {
      return Promise.reject(`Task with id ${taskId} doesn't exist.`);
    }
  }

  compensateTaskDeletionFromMemory(taskId: string) {
    return this.findTaskById(taskId)
      .then((task) => {
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
        Promise.resolve("Task restoration in memory succeded");
      })
      .catch((err) =>
        Promise.reject(`Task restoration in memory failed due ${err}`)
      );
  }
}
