import { TaskRepository } from "../../application/task/TaskRepository";
import { AppCron } from "../../domain/AppCron";
import { Task } from "../../domain/Task";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { CronTaskInterface } from "../../application/task/CronTaskInterface";

//const appCron = new AppCron();

export class CronTaskManager implements CronTaskInterface {
  private appCron: AppCron;
  private delegate: TaskRepository;

  constructor(delegate: TaskRepository, appCron: AppCron) {
    this.delegate = delegate;
    this.appCron = appCron;
  }

  async transformTaskFromDbToCron(): Promise<string> {
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
      .then((taskId) => {
        return this.findTaskById(task.id)
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
            return Promise.resolve(`Task with ${taskId} added`);
          })
          .catch((error) =>
            this.compensateTaskAdditionToDB(task.id)
              .catch((compensationError) =>
                Promise.reject(
                  `Task not added due to error: ${error}, ${compensationError}`
                )
              )
              .then((compensation) =>
                Promise.reject(
                  `Task not added due to error: ${error}, ${compensation}`
                )
              )
          );
      });
  }
  async findTaskById(taskId: string): Promise<AggregatedTask> {
    return await this.delegate.findTaskById(taskId);
  }
  async findAllTask(): Promise<AggregatedTask[]> {
    return this.delegate.findAllTask();
  }

  async findTasksForDevice(deviceId: string): Promise<Task[]> {
    return this.delegate.findTasksForDevice(deviceId);
  }

  async deleteTask(taskId: string): Promise<string> {
    return this.appCron
      .deleteTask(taskId)
      .catch((error) =>
        Promise.reject(`Task not deleted due to error: ${error}`)
      )
      .then(() =>
        this.delegate
          .deleteTask(taskId)
          .then((deletionCompleted) => deletionCompleted)
          .catch((error) =>
            this.compensateTaskDeletionFromMemory(taskId)

              .catch((compensationError) =>
                Promise.reject(
                  `Task deletion failed due to error: ${error} ${compensationError}`
                )
              )
              .then((result) =>
                Promise.reject(
                  `Task deletion failed due to error:  ${error}, ${result}`
                )
              )
          )
      );
  }

  compensateTaskAdditionToDB(taskId: string) {
    return this.delegate
      .deleteTask(taskId)
      .then((response) => {
        console.log("Add task compensation succeded.");
        return Promise.resolve(`Compensation succeeded: ${response}`);
      })
      .catch((error) => {
        console.log("Add task compensation failed.");
        return Promise.reject(
          `Task add compensation failed due to error: ${error}`
        );
      });
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
        console.log("Task restoration to cron succeded");
        return Promise.resolve("Task restoration to cron succeded");
      })
      .catch((err) => {
        console.log(`Task restoration to cron failed.`);
        return Promise.reject(
          `Task restoration to cron failed due error: ${err}`
        );
      });
  }
}
