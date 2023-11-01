import cron from "node-cron";

import { exec } from "child_process";
import { ManagerResponse } from "../application/task/TaskManager";

export class AppCron {
  async installTask(
    taskId: string,
    minutes: number,
    hours: number,
    command: string
  ) {
    const cronString = `${minutes} ${hours} * * * `;

    const task = cron.schedule(
      cronString,
      () => {
        try {
          console.log(command);
          exec(command);
        } catch (err) {
          console.log(err);
        }
      },
      { name: taskId, scheduled: true, timezone: "Europe/Warsaw" }
    );
    task.start();
    return Promise.resolve({ taskId: taskId });
  }

  async deleteTask(taskId: string): Promise< ManagerResponse<object | string>> {
    const memoryTaskList = cron.getTasks();
    const task = memoryTaskList.get(taskId);
    task?.stop();
    const isDeletedFromMemory = memoryTaskList.delete(taskId);
    return isDeletedFromMemory
      ? Promise.resolve({["Task deleted"]: "No errors"})
      : Promise.reject({error: `Task with id ${taskId} doesn't exist.`});
  }
}


