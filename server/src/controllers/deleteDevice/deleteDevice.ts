import Koa from "koa";
import { deviceService } from "../../server";

export async function deleteDevice(ctx: Koa.Context) {
    const taskId = ctx.params.id;
    try{
    const response = await deviceService.deleteDevice(taskId);
    if (response) {
      ctx.status = 200;
      ctx.body = { "Task deleted": response };
    }}catch(err){
        ctx.status = 500;
        ctx.body = { "Task not deleted due to error": err };  
    }
  }