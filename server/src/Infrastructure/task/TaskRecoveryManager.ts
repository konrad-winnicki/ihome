import { TaskRepository } from "../../application/task/TaskRepository";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { TaskRecovery } from "../../application/task/TaskRecovery";
import { TaskSchedule } from "../../domain/TaskSchedule";
import { ManagerResponse } from "../../application/task/TaskManager";

//const appCron = new AppCron();

export class TaskRecoveryManager implements TaskRecovery {
  private appCron: TaskSchedule;
  private taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository, appCron: TaskSchedule) {
    this.taskRepository = taskRepository;
    this.appCron = appCron;
  }

  async transformTaskFromDbToCron(): Promise<ManagerResponse<object | string>> {
    return this.taskRepository
      .listAll()
      .then((tasks) => {
        tasks.forEach((task: AggregatedTask) => {
          this.appCron.installTask(
            task.id,
            task.minutes,
            task.hour,
            task.onStatus,
            task.commandOn,
            task.commandOff,
            task.deviceId
          );
        });

        return Promise.resolve({
          ["Task transfered from database to cron"]: "No errors",
        });
      })
      .catch((error) =>
        Promise.reject({ [`Task not transfered to cron due error`]: error })
      );
  }
}
