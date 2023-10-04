import { Meter } from "../../domain/Meter";
import { DeviceInterface } from "../../application/device/DeviceInterface";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
import { DeviceListingInterface } from "../../application/device/DeviceListingInterface";
//const appCron = new AppCron();


export class DeviceManager implements DeviceInterface, DeviceListingInterface {
  delegate:  DeviceInterface & DeviceListingInterface
  constructor(
    delegate: DeviceInterface & DeviceListingInterface
  ) {
    this.delegate = delegate;
  }

 
  async addDevice(device: Device): Promise<string> {
    try {
      const result = this.delegate.addDevice(device);
      console.log("call times");
      return result;
    } catch (err) {
      return `Adding failed due to error: ${err}`;
    }
  }

  async deleteDevice(deviceId:string):Promise<string> {
    try {
      const result = this.delegate.deleteDevice(deviceId)
      return result;
    } catch (err) {
      return `Adding failed due to error: ${err}`;
    }
  }
  

  async getMeterList(): Promise<Meter[]> {
    return this.delegate.getMeterList()
  }

  async getSwitchList(): Promise<Switch[]> {
    return this.delegate.getSwitchList()
   
  }
  
}
