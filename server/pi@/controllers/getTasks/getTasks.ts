import Koa from "koa";
import { taskService } from "../../dependencias";


export async function getTasksForDevice(ctx: Koa.Context) {
    const deviceId = await ctx.params.id;
    
    return taskService.findTasksForDevice(deviceId)
    .then((tasks) => {
        ctx.status = 200;
        ctx.body = tasks;
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = { "Task not deleted due to error": error };
      });
  }