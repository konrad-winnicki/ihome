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
    return this.delegate.addDevice(device)
    
  }

  async deleteDevice(deviceId:string):Promise<string> {
    return this.delegate.deleteDevice(deviceId)
  }
  

  async getMeterList(): Promise<Meter[]> {
    return this.delegate.getMeterList()
  }

  async getSwitchList(): Promise<Switch[]> {
    return this.delegate.getSwitchList()
   
  }
  
}
