import Koa from "koa";
import { devicesInMemory, deviceRunService } from "../../dependencias";
import { Switch } from "../../domain/Switch";

export type RunSwitchRequestBody = {
  switchOn: boolean;
};

export async function runSwitch(ctx: Koa.Context) {
  const switchDeviceId = await ctx.params.id;
  const switchStatus = (await ctx.request.body) as RunSwitchRequestBody;
/*
  if (!runSwitchGuardFunction(switchStatus)) {
    ctx.status = 400;
    return (ctx.body = {
      "Bad request": "switchOn: boolean required",
    });
  }
*/
  const switchDevice = devicesInMemory.devices.get(switchDeviceId);
  if (!switchDevice) {
    ctx.status = 404;
    return (ctx.body = `Device with ${switchDeviceId} not found`);
  }

  switchStatus.switchOn;
  try {
    let response = "";
    if (switchStatus.switchOn) {
      response = await deviceRunService.switchOn(switchDevice);
    } else {
      response = await deviceRunService.switchOff(switchDevice as Switch);
    }
    ctx.status = 200;
    return (ctx.body = response);
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    return (ctx.body = error);
  }
}
