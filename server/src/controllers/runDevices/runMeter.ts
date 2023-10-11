import Koa from "koa";
import { devicesInMemory, deviceRunService } from "../../dependencias";

export async function runMeter(ctx: Koa.Context) {
  const meterId = await ctx.params.id;
  const meter = devicesInMemory.devices.get(meterId);
  
  if (meter) {
   return deviceRunService
      .switchOn(meter)
      .then((collectedData) => {
        ctx.status = 200;
        ctx.body = collectedData;
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = error;
      });
  }
}
