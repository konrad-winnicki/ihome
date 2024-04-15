import { TaskRepository } from "../../application/task/TaskRepositoryInterface";
import { TaskRecovery } from "../../application/task/TaskRecovery";
import { TaskScheduler } from "../cache/TaskScheduler";
import { ManagerResponse } from "../../application/task/TaskManagerInterface";
import { Task } from "../../domain/Task";

export class TaskRecoveryManager implements TaskRecovery {
  private appCron: TaskScheduler;
  private taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository, appCron: TaskScheduler) {
    this.taskRepository = taskRepository;
    this.appCron = appCron;
  }

  async transformTaskFromDbToCron(): Promise<ManagerResponse<object | string>> {
    return this.taskRepository
      .listAll()
      .then((tasks) => {
        tasks.forEach((task: Task) => {
          this.appCron.add(
            task.id,
            Number(task.scheduledTime.minutes),
            Number(task.scheduledTime.hour),
            task.onStatus,
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
