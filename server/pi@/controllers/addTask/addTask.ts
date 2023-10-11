import Koa from "koa";
import { taskService } from "../../dependencias";
import { Task } from "../../domain/Task";
import { v4 } from "uuid";

export async function createTask(ctx: Koa.Context) {
  const data = (await ctx.request.body) as Task;
  //TODO: add guard function for incoming task
  const task = new Task(v4(), data.deviceId, data.onStatus, data.scheduledTime);
  return taskService
    .addTask(task)
    .then((response) => {
      ctx.status = 201;
      ctx.body = {taskId: response};
    })
    .catch((error) => {
      ctx.status = 500;
      ctx.body = error;
    });
}
