import { DeviceInterface } from "./DeviceInterface";
import { Device } from "../../domain/Device";
import { Meter } from "../../domain/Meter";
import { Switch } from "../../domain/Switch";

export class DeviceService {
  private deviceInterface: DeviceInterface;
  constructor(deviceInterface: DeviceInterface) {
    this.deviceInterface = deviceInterface;
  }

  addDeviceToDB(device: Device): Promise<string> {
    return this.deviceInterface.addDeviceToDB(device);
  }
  addDeviceToLocalStorage(device: Device): boolean {
    return this.deviceInterface.addDeviceToLocalStorage(device);
  }
  /*
  deleteSwitcher(switchDeviceId: string): Promise<boolean> {
    return this.switchInterface.deleteSwitcher(switchDeviceId);
  }
  */
  getMeterList(): Promise<Meter[]> {
    return this.deviceInterface.getMeterList();
  }
  getSwitchList(): Promise<Switch[]> {
    return this.deviceInterface.getSwitchList();
  }
}
