import { Device } from "../../domain/Device";

export interface DeviceRunInterface {
  switchOn: (device: Device) => Promise<string>;
  switchOff: (device: Device) => Promise<string>;
  getById(deviceId: string): Promise<Device> 
  //listActivatedSwitches: () => Promise<Array<string>>;
}
