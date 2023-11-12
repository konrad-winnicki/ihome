import Koa from "koa";
import { DeviceRunInterface } from "../application/device/DeviceRunInterface";

export type RunSwitchRequestBody = {
  switchOn: boolean;
};

export class RunDeviceControllers {
  private deviceRunService: DeviceRunInterface;
  constructor(deviceRunService: DeviceRunInterface) {
    this.deviceRunService = deviceRunService;
    this.runDevice = this.runDevice.bind(this);

  }

  
  async runDevice(ctx: Koa.Context) {
    const deviceId = await ctx.params.id;
    const onStatus = (await ctx.request.body)

   return this.deviceRunService.getById(deviceId).then((device)=>{
      if (onStatus) {
        ctx.status = 200
        ctx.body =  this.deviceRunService.switchOn(device);
      } else {
        ctx.status = 200
        ctx.body = this.deviceRunService.switchOff(device);
      }
   
    }).catch((error)=> {
      if (JSON.stringify(error).includes("NonExistsError")) {
        ctx.status = 404;
        return (ctx.body = error);
      }
      console.log(error);
      ctx.status = 500;
      return (ctx.body = error);
    })
    
  }

}
