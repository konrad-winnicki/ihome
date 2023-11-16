import {
  prepareSwitchClassInstance,
  prepareMeterClassInstance,
} from "./guardHelpers/deviceClassInstancePreparators";
import { isMeter, isSwitch } from "./guardHelpers/addDeviceGuardHelpers";
import { Sensor } from "../../../domain/Sensor";
import { Switch } from "../../../domain/Switch";
import Koa, { Next } from "koa";

interface DeviceRequest {
  deviceType: string;
}

export async function addDeviceGuardMiddleware(ctx: Koa.Context, next: Next) {
  const body = await ctx.request.body;
  const deviceType: string = (body as DeviceRequest).deviceType;

  if (deviceType == "switch") {
    const maybeSwitch = body as Switch;
    if (isSwitch(maybeSwitch)) {
      ctx.device = prepareSwitchClassInstance(maybeSwitch);
      await next();
      return;
    }
  } else if (deviceType == "meter") {
    const maybeMeter = body as Sensor;
    if (isMeter(maybeMeter)) {
      ctx.device = prepareMeterClassInstance(maybeMeter);
      await next();
      return;
    }
  }

  ctx.status = 400;
  return (ctx.body = {
    BadRequest: `For meters request must contain following parameters:\n 
  {deviceType: string, name:string, parameters:{[key:string]: sting}, commandOn:string}\n
  For switches request must contain following parameters:\n 
  {deviceType: string, name:string, commandOn:string, commandOff: string}`,
  });
}
