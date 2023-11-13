import Koa from "koa";
import { DeviceRunInterface } from "../application/device/DeviceRunInterface";

export type RunSwitchRequestBody = {
  onStatus: boolean;
};

export class RunDeviceControllers {
  private deviceRunService: DeviceRunInterface;
  constructor(deviceRunService: DeviceRunInterface) {
    this.deviceRunService = deviceRunService;
    this.runDevice = this.runDevice.bind(this);
  }

  async runDevice(ctx: Koa.Context) {
    const deviceId = await ctx.params.id;
    const status = (await ctx.request.body) as RunSwitchRequestBody;
    return this.deviceRunService
      .getById(deviceId)
      .then((device) => {
        if (status.onStatus) {
          return this.deviceRunService.switchOn(device).then((response) => {
            ctx.status = 200;
            ctx.body = response;
          });
        } else {
          return this.deviceRunService.switchOff(device).then((response) => {
            ctx.status = 200;
            ctx.body = response;
          });
        }
      })
      .catch((error) => {
        if (JSON.stringify(error).includes("NonExistsError")) {
          ctx.status = 404;
          return (ctx.body = error);
        }
        console.log(error);
        ctx.status = 500;
        return (ctx.body = error);
      });
  }
}
