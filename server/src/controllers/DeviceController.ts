import Koa from "koa";
import { DeviceService } from "../application/device/DeviceService";

export class DeviceController {
  private deviceService: DeviceService;
  constructor(deviceService: DeviceService) {
    this.deviceService = deviceService;
    this.addDevice = this.addDevice.bind(this);
    this.deleteDevice = this.deleteDevice.bind(this);
    this.getSensors = this.getSensors.bind(this);
    this.getSwitches = this.getSwitches.bind(this);
  }


  async addDevice(ctx: Koa.Context) {    
    return this.deviceService
      .addDevice(ctx.device)
      .then((response) => {
        ctx.status = 201;
        ctx.body = response;
      })
      .catch((error) => {
        if (JSON.stringify(error).includes("NameConflictError")) {
          ctx.status = 409;
          return (ctx.body = error);
        }
        ctx.status = 500;
        ctx.body = error;
      });
  }

  async deleteDevice(ctx: Koa.Context) {
    const deviceId = await ctx.params.id;

    return this.deviceService
      .deleteDevice(deviceId)
      .then((response) => {
        ctx.status = 200;
        ctx.body = response;
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = error;
      });
  }
  async getSensors(ctx: Koa.Context) {
    return this.deviceService
      .getSensorList()
      .then((response) => {
        ctx.status = 200;
        ctx.body = response;
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = error;
      });
  }

  async getSwitches(ctx: Koa.Context) {
    return this.deviceService
      .getSwitchList()
      .then((response) => {
        ctx.status = 200;
        ctx.body = response;
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = error;
      });
  }
}
