import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
export interface DeviceRunInterface {
  switchOn: (device: Device) => Promise<string>;
  switchOff: (device: Switch) => Promise<string>;
}
