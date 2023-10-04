import { DeviceInterface } from "./DeviceInterface";
import { Device } from "../../domain/Device";
import { Meter } from "../../domain/Meter";
import { Switch } from "../../domain/Switch";
import { DeviceListingInterface } from "./DeviceListingInterface";

export class DeviceService {
  private deviceInterface: DeviceInterface ;
  private deviceListingInterface: DeviceListingInterface;

  constructor(deviceInterface: DeviceInterface, deviceListingInterface: DeviceListingInterface) {
    this.deviceInterface = deviceInterface;
    this.deviceListingInterface = deviceListingInterface
  }

  addDevice(device: Device): Promise<string> {
    return this.deviceInterface.addDevice(device);
  }
 
  
  deleteDevice(deviceId: string): Promise<string> {
    return this.deviceInterface.deleteDevice(deviceId);
  }
  
 
  getMeterList(): Promise<Meter[]> {
    return this.deviceListingInterface.getMeterList();
  }
  getSwitchList(): Promise<Switch[]> {
    return this.deviceListingInterface.getSwitchList();
  }  
}
