import Koa from "koa";
import { InMemoryDeviceStorage } from "../domain/InMemoryDeviceStorage";
import { Switch } from "../domain/Switch";
import { DeviceRunService } from "../application/device/DeviceRunService";

export type RunSwitchRequestBody = {
  switchOn: boolean;
};

export class RunDeviceControllers {
  private deviceRunService: DeviceRunService;
  private devicesInMemory: InMemoryDeviceStorage;
  constructor(
    deviceRunService: DeviceRunService,
    devicesInMemory: InMemoryDeviceStorage
  ) {
    this.deviceRunService = deviceRunService;
    this.devicesInMemory = devicesInMemory;
    this.runMeter = this.runMeter.bind(this);
    this.runSwitch = this.runSwitch.bind(this);
  }

  async runMeter(ctx: Koa.Context) {
    const meterId = await ctx.params.id;
    const meter = this.devicesInMemory.devices.get(meterId);

    if (meter) {
      return this.deviceRunService
        .switchOn(meter)
        .then((collectedData) => {
          ctx.status = 200;
          ctx.body = collectedData;
        })
        .catch((error) => {
          ctx.status = 500;
          ctx.body = error;
        });
    }
    ctx.status = 404;
    return (ctx.body = { Error: `Device with ${meterId} does not exist` });
  }

  async runSwitch(ctx: Koa.Context) {
    const switchDeviceId = await ctx.params.id;
    const switchStatus = (await ctx.request.body) as RunSwitchRequestBody;

    const switchDevice = this.devicesInMemory.devices.get(switchDeviceId);
    if (!switchDevice) {
      ctx.status = 404;
      return (ctx.body = `Device with ${switchDeviceId} not found`);
    }

    switchStatus.switchOn;
    try {
      let response = "";
      if (switchStatus.switchOn) {
        response = await this.deviceRunService.switchOn(switchDevice);
      } else {
        response = await this.deviceRunService.switchOff(
          switchDevice as Switch
        );
      }
      ctx.status = 200;
      return (ctx.body = response);
    } catch (error) {
      console.log(error);
      ctx.status = 500;
      return (ctx.body = error);
    }
  }
}
