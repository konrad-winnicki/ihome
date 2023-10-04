import Koa from "koa";
import { Device } from "../../domain/Device";
import { Meter } from "../../domain/Meter";
import { Switch } from "../../domain/Switch";
import { deviceService } from "../../server";
import {
  prepareMeterInstance,
  prepareSwitchInstance,
} from "./addDeviceHelpers";
import { isMeterGuardFunction, isSwitchGuardFunction } from "../guardFunctions";

interface DeviceRequest {
  deviceType: string;
}

export async function addDevice(ctx: Koa.Context) {
  const body = await ctx.request.body;
  const deviceType: string = (body as DeviceRequest).deviceType;

  let device: Device | null = null;
  if (deviceType == "switch") {
    const maybeSwitch = body as Switch;
    if (isSwitchGuardFunction(maybeSwitch)) {
      device = prepareSwitchInstance(maybeSwitch);
      // TODO: recreate instance of this class if needed
    }
  } else if (deviceType == "meter") {
    const maybeMeter = body as Meter;
    if (isMeterGuardFunction(maybeMeter)) {
      device = prepareMeterInstance(maybeMeter);
    }
  }

  if (device) {
    const result = await deviceService.addDevice(device);
    ctx.status = 201;
    return (ctx.body = { deviceId: result });
  }
  ctx.status = 400;
  return (ctx.body = {
    "Bad request": "Wrong parameters passed for device",
  });
}
