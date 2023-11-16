import cron from "node-cron";

import { ManagerResponse } from "../application/task/TaskManager";
import { DeviceRunInterface } from "../application/device/DeviceRunInterface";

export class TaskScheduler {
  private deviceRunService: DeviceRunInterface;
  constructor(deviceRunService: DeviceRunInterface) {
    this.deviceRunService = deviceRunService;
  }

  public async add(
    taskId: string,
    minutes: number,
    hours: number,
    onStatus: boolean,
    deviceId: string
  ) {
    const timeString = `${minutes} ${hours} * * * `;
    const task = await this.setUpTaskSchedule(
      taskId,
      deviceId,
      onStatus,
      timeString
    );
    task.start();
    return Promise.resolve({ taskId: taskId });
  }

  async setUpTaskSchedule(
    taskId: string,
    deviceId: string,
    onStatus: boolean,
    time: string
  ) {
    return cron.schedule(
      time,
      () => {
        this.deviceRunService
          .getById(deviceId)
          .then((device) => {
            if (onStatus) {
              return this.deviceRunService.switchOn(device.id);
            }
            return this.deviceRunService.switchOff(device.id);
          })
          .catch((error) => console.log(error));
      },
      { name: taskId, scheduled: false, timezone: "Europe/Warsaw" }
    );
  }

  public async delete(
    taskId: string
  ): Promise<ManagerResponse<object | string>> {
    const tasks = cron.getTasks();
    const task = tasks.get(taskId);
    task?.stop();
    const isDeleted = tasks.delete(taskId);
    return isDeleted
      ? Promise.resolve({ ["Task deleted"]: "No errors" })
      : Promise.reject({ error: `Task with id ${taskId} doesn't exist.` });
  }
}
