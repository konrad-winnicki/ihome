import Koa from "koa";
import { devicesInMemory, deviceRunService } from "../../server";
import { Switch } from "../../domain/Switch";
import { runSwitchGuardFunction } from "../guardFunctions";

export type RunSwitchRequestBody = {
  switchOn: boolean;
};

export async function runSwitch(ctx: Koa.Context) {
  const switchDeviceId = await ctx.params.id;
  const data = (await ctx.request.body) as RunSwitchRequestBody;

  if (!runSwitchGuardFunction(data)) {
    ctx.status = 400;
    return (ctx.body = {
      "Bad request": "switchOn: boolean required",
    });
  }

  const switchDevice = devicesInMemory.devices.get(switchDeviceId);
  if (!switchDevice) {
    ctx.status = 404;
    return (ctx.body = `Device with ${switchDeviceId} not found`);
  }

  const isTurnOn = data.switchOn;
  try {
    let response = "";

    if (isTurnOn) {
      response = await deviceRunService.switchOn(switchDevice);
    } else {
      response = await deviceRunService.switchOff(switchDevice as Switch);
    }
    ctx.status = 200;
    ctx.body = response;
  } catch (err) {
    console.log(err);
    ctx.status = 500;
    ctx.body = err;
  }
}
