import cron from "node-cron";

import { exec } from "child_process";
import { ManagerResponse } from "../application/task/TaskManager";
import { ActivatedSwitches } from "./ActivatedSwitches";

export class TaskSchedule {
  async installTask(
    taskId: string,
    minutes: number,
    hours: number,
    onStatus: boolean,
    commandOn: string,
    commandOff: string | null,
    deviceId: string
  ) {
    const cronString = `${minutes} ${hours} * * * `;

    const task = cron.schedule(
      cronString,
      () => {
        try {
          const runningSwitches = ActivatedSwitches.getInstance();

          if (onStatus) {
            runningSwitches.add(deviceId);
            console.log(commandOn);
            exec(commandOn);
          } else if (!onStatus && commandOff) {
            runningSwitches.delete(deviceId);

            console.log(commandOff);
            exec(commandOff);
          }
        } catch (err) {
          console.log(err);
        }
      },
      { name: taskId, scheduled: true, timezone: "Europe/Warsaw" }
    );
    task.start();
    return Promise.resolve({ taskId: taskId });
  }

  async deleteTask(taskId: string): Promise<ManagerResponse<object | string>> {
    const memoryTaskList = cron.getTasks();
    const task = memoryTaskList.get(taskId);
    //TODO: delete from runningSwitches
    task?.stop();
    const isDeletedFromMemory = memoryTaskList.delete(taskId);
    return isDeletedFromMemory
      ? Promise.resolve({ ["Task deleted"]: "No errors" })
      : Promise.reject({ error: `Task with id ${taskId} doesn't exist.` });
  }
}
