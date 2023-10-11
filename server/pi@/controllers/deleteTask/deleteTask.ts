import Koa from "koa";
import { taskService } from "../../dependencias";

export async function deleteTask(ctx: Koa.Context) {
    const taskId = ctx.params.id
    return taskService.deleteTaskFromDB(taskId)
    .then((response) => {
      ctx.status = 200;
      ctx.body = { "Task deleted": response };
    })
    .catch((error) => {
      ctx.status = 500;
      ctx.body = { "Task not deleted due to error": error };
    });
  }