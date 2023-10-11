import Koa from "koa";
import { deviceService } from "../../dependencias";

export async function addDevice(ctx: Koa.Context) {
  return deviceService
    .addDevice(ctx.device)
    .then((response) => {
      console.log(response);
      ctx.status = 201;
      ctx.body = { deviceId: response };
    })
    .catch((error) => {
      ctx.status = 500;
      ctx.body = error;
    });
}
