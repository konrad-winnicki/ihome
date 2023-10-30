import cron from "node-cron";

import { exec } from "child_process";

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
    Promise.resolve({ taskId: taskId });
  }

  async deleteTask(taskId: string): Promise<string> {
    const memoryTaskList = cron.getTasks();
    const isDeletedFromMemory = memoryTaskList.delete(taskId);
    return isDeletedFromMemory
      ? Promise.resolve("Task deleted")
      : Promise.reject(`Task with id ${taskId} doesn't exist.`);
  }
}
