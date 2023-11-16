import { Device } from "../../domain/Device";

export interface DeviceRunInterface {
  switchOn: (deviceId:string) => Promise<string>;
  switchOff: (deviceId: string) => Promise<string>;
  getById(id: string): Promise<Device> 
}
