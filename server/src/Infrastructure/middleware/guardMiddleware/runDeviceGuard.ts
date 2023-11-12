import Koa, { Next } from "koa";
import { isRunSwitch } from "./guardHelpers/runSwitchGuardHelpers";

export type RunSwitchRequestBody = {
  switchOn: boolean;
};

export async function runDeviceGuardMiddleware(ctx: Koa.Context, next: Next) {
  const body = (await ctx.request.body) as RunSwitchRequestBody;

  if (isRunSwitch(body)) {
    ctx.switchOn = body;
    await next();
    return;
  }

  ctx.status = 400;
  return (ctx.body = {
    "Bad request": "Switch on request must contain {switchOn: boolean}",
  });
}
