import { TaskRepositoryInterface } from "../../application/task/TaskRepositoryInterface";
import { AppCron } from "../../domain/AppCron";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { CronTaskInterface } from "../../application/task/CronTaskInterface";
import { ManagerResponse } from "../../application/task/TaskManagerInterface";
//const appCron = new AppCron();

export class CronTaskRepository implements CronTaskInterface {
  private appCron: AppCron;
  private taskRepository: TaskRepositoryInterface

  constructor( taskRepository: TaskRepositoryInterface, appCron: AppCron) {
    this.taskRepository = taskRepository
    this.appCron = appCron;
  }

  async transformTaskFromDbToCron(): Promise<ManagerResponse<object|string>> {
    return this.taskRepository.findAllTask()
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

        return Promise.resolve({["Task transfered from database to cron"]: "No errors"});
      })
      .catch((error) =>
        Promise.reject({[`Task not transfered to cron due error`]: error})
      );
  }
}