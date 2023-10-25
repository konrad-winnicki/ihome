import Koa from "koa";
import { Task } from "../domain/Task";
import { v4 } from "uuid";
import { TaskService } from "../application/task/TaskService";
/*
export type DeviceControllers = {
  addDevice: (ctx: Koa.Context) => Promise<void>;
};
*/

export class TaskControllers {
  private taskService: TaskService;
  constructor(taskService: TaskService) {
    this.taskService = taskService;
    this.createTask = this.createTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.getTasksForDevice = this.getTasksForDevice.bind(this);
  }

  async createTask(ctx: Koa.Context) {
    const data = (await ctx.request.body) as Task;
    const task = new Task(
      v4(),
      data.deviceId,
      data.onStatus,
      data.scheduledTime
    );

    return this.taskService
      .add(task)
      .then((response) => {
        ctx.status = 201;
        ctx.body = response;
      })
      .catch((error) => {
        console.log(typeof error);
        ctx.status = 500;
        ctx.body = error;
      });
  }

  async deleteTask(ctx: Koa.Context) {
    const taskId = ctx.params.id;
    return this.taskService
      .delete(taskId)
      .then((response) => {
        ctx.status = 200;
        ctx.body = response;
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = error;
      });
  }

  async getTasksForDevice(ctx: Koa.Context) {
    const deviceId = await ctx.params.id;

    return this.taskService.getByDevice(deviceId)
      .then((tasks) => {
        ctx.status = 200;
        ctx.body = tasks;
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = error;
      });
  }
}
