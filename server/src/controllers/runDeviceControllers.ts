import Koa from "koa";
import { DeviceRunInterface } from "../application/device/DeviceRunInterface";

export type RunSwitchRequestBody = {
  switchOn: boolean;
};

export class RunDeviceControllers {
  private deviceRunService: DeviceRunInterface;
  constructor(deviceRunService: DeviceRunInterface) {
    this.deviceRunService = deviceRunService;
    this.activateMeter = this.activateMeter.bind(this);
    this.runSwitch = this.runSwitch.bind(this);
  }

  async activateMeter(ctx: Koa.Context) {
    const meterId = await ctx.params.id;
    return this.deviceRunService
      .switchOn(meterId)
      .then((collectedData) => {
        ctx.status = 200;
        ctx.body = collectedData;
      })
      .catch((error) => {
        if (JSON.stringify(error).includes("NonExistsError")) {
          ctx.status = 404;
          return (ctx.body = `Device with ${meterId} not found`);
        }
        ctx.status = 500;
        ctx.body = error;
      });
  }

  async runSwitch(ctx: Koa.Context) {
    const switchDeviceId = await ctx.params.id;
    const switchStatus = (await ctx.request.body) as RunSwitchRequestBody;

    switchStatus.switchOn;
    try {
      let response = "";
      if (switchStatus.switchOn) {
        response = await this.deviceRunService.switchOn(switchDeviceId);
      } else {
        response = await this.deviceRunService.switchOff(switchDeviceId);
      }
      ctx.status = 200;
      return (ctx.body = response);
    } catch (error) {
      if (JSON.stringify(error).includes("NonExistsError")) {
        ctx.status = 404;
        return (ctx.body = `Device with ${switchDeviceId} not found`);
      }
      console.log(error);
      ctx.status = 500;
      return (ctx.body = error);
    }
  }

}
