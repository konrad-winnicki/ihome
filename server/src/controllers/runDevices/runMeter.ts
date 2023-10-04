import Koa from "koa";
import { devicesInMemory, deviceRunService } from "../../server";

export async function runMeter(ctx: Koa.Context) {
  const meterId = await ctx.params.id;

  const meter = devicesInMemory.devices.get(meterId);
  if (meter) {
    try {
      const result = await deviceRunService.switchOn(meter);
      console.log("METER RUN", result);
      ctx.status = 200;
      ctx.body = result;
    } catch (err) {
      console.log(err);
      ctx.status = 500;
      ctx.body = err;
    }
  }
}
