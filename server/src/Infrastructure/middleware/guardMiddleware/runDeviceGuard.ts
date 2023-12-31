import Koa, { Next } from "koa";
import { isRunDevice } from "./guardHelpers/runSwitchGuardHelpers";

export type RunDeviceRequestBody = {
  onStatus: boolean;
};

export async function runDeviceGuardMiddleware(ctx: Koa.Context, next: Next) {
  const body = (await ctx.request.body) as RunDeviceRequestBody;

  if (isRunDevice(body)) {
    ctx.onStatus = body;
    await next();
    return;
  }

  ctx.status = 400;
  return (ctx.body = {
    "Bad request": "Device on/off request must contain {onStatus: boolean}",
  });
}
