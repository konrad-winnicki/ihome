import {
  prepareSwitchClassInstance,
  prepareSensorClassInstance,
} from "./guardHelpers/deviceClassInstancePreparators";
import { isSensor, isSwitch } from "./guardHelpers/addDeviceGuardHelpers";
import { Sensor } from "../../../domain/Sensor";
import { Switch } from "../../../domain/Switch";
import Koa, { Next } from "koa";

interface DeviceRequest {
  deviceType: string;
}

export async function addDeviceGuardMiddleware(ctx: Koa.Context, next: Next) {
  const body = await ctx.request.body;
  const deviceType: string = (body as DeviceRequest).deviceType;
  console.log("ffff", deviceType);
  if (deviceType == "switch") {
    const maybeSwitch = body as Switch;
    if (isSwitch(maybeSwitch)) {
      ctx.device = prepareSwitchClassInstance(maybeSwitch);
      await next();
      return;
    }
  } else if (deviceType == "sensor") {
    const maybeSensor = body as Sensor;
    if (isSensor(maybeSensor)) {
      ctx.device = prepareSensorClassInstance(maybeSensor);
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
