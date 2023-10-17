import Koa, { Next } from "koa";
import { Task } from "../../../domain/Task";
import { isTask } from "./guardHelpers/addTaskGuardHelpers";
import { v4 } from "uuid";

export async function addTaskGuardMiddleware(ctx: Koa.Context, next: Next) {
  const body = (await ctx.request.body) as Task;

  const maybeTask = body as Task;
  if (isTask(maybeTask)) {
    ctx.task = new Task(
      v4(),
      maybeTask.deviceId,
      maybeTask.onStatus,
      maybeTask.scheduledTime
    );
    await next();
    return;
  }

  ctx.status = 400;
  return (ctx.body = {BadRequest:`Task request must contain following parameters:\n 
  {deviceId: string, onStatus:boolean, scheduledTime:{hour: sting, minutes:string}`});
}
