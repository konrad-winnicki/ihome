import Koa from "koa";
import { deviceService } from "../../dependencias";

export async function deleteDevice(ctx: Koa.Context) {
  const deviceId = ctx.params.id;

  return deviceService
    .deleteDevice(deviceId)
    .then((response) => {
      ctx.status = 200;
      ctx.body = { "Device deleted": response };
    })
    .catch((error) => {
      ctx.status = 500;
      ctx.body = { "Device not deleted due to error": error };
    });


}
