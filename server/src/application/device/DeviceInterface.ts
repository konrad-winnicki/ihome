import { Device } from "../../domain/Device";

export interface DeviceInterface {
  addDevice: (device: Device) => Promise<string>;

  deleteDevice: (deviceId: string) => Promise<string>;
 
}
