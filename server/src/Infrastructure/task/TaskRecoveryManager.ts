import { TaskRepository } from "../../application/task/TaskRepository";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { TaskRecovery } from "../../application/task/TaskRecovery";
import {
  ManagerResponse,
  TaskManager,
} from "../../application/task/TaskManager";
//const appCron = new AppCron();

export class TaskRecoveryManager implements TaskRecovery {
  private taskManager: TaskManager;
  private taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository, taskManager: TaskManager) {
    this.taskRepository = taskRepository;
    this.taskManager = taskManager;
  }

  async transformTaskFromDbToCron(): Promise<ManagerResponse<object | string>> {
    return this.taskRepository
      .listAll()
      .then((tasks) => {
        tasks.forEach((task: AggregatedTask) => {
          this.taskManager.add(task);
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
