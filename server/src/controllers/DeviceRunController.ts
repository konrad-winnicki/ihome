import Koa from "koa";
import { DeviceRunInterface } from "../application/device/DeviceRunInterface";

export type RunDeviceRequestBody = {
  onStatus: boolean;
};

export class RunDeviceController {
  private deviceRunService: DeviceRunInterface;
  constructor(deviceRunService: DeviceRunInterface) {
    this.deviceRunService = deviceRunService;
    this.runDevice = this.runDevice.bind(this);
  }

  async runDevice(ctx: Koa.Context) {
    const deviceId = await ctx.params.id;
    const status = (await ctx.request.body) as RunDeviceRequestBody;

    if (status.onStatus) {
      return this.deviceRunService
        .switchOn(deviceId)
        .then((response) => {
          ctx.status = 200;
          ctx.body = response;
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
    } else {
      return this.deviceRunService
        .switchOff(deviceId)
        .then((response) => {
          ctx.status = 200;
          ctx.body = response;
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
}
