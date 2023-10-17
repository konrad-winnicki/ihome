
import Koa from "koa";
import { MongoDeviceManager } from "../Infrastructure/device/MongoDeviceManager";
/*
export type DeviceControllers = {
  addDevice: (ctx: Koa.Context) => Promise<void>;
};
*/


export class DeviceControllers  {
  private deviceService:MongoDeviceManager
  constructor(
    deviceService: MongoDeviceManager
  ){
    this.deviceService = deviceService
    this.addDevice = this.addDevice.bind(this)
    this.deleteDevice = this.deleteDevice.bind(this)
    this.getMeters = this.getMeters.bind(this)
    this.getSwitches = this.getSwitches.bind(this)
  }
    async addDevice(ctx: Koa.Context) {
    return this.deviceService
      .addDevice(ctx.device)
      .then((response) => {
        ctx.status = 201;
        ctx.body = { deviceId: response };
      })
      .catch((error) => {
        console.log(error);
        if (error.includes('NameConflictError')){
          ctx.status = 409;
         return ctx.body = {"ConflictError": error};
        }
        ctx.status = 500;
        ctx.body = {"Error": error};
      });
  }

   async deleteDevice(ctx: Koa.Context) {
    const deviceId = ctx.params.id;
  
    return this.deviceService
      .deleteDevice(deviceId)
      .then((response) => {
        ctx.status = 200;
        ctx.body = { "Device deleted": response };
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = { "Device not deleted due to error": error };
      });
  
  }
 async getMeters(ctx: Koa.Context) {
    return this.deviceService
      .getMeterList()
      .then((response) => {
        ctx.status = 200;
        ctx.body = response;
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = error;
      });
  }


  async  getSwitches(ctx: Koa.Context) {
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


