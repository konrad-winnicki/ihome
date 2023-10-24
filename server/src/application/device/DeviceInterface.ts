import { Device } from "../../domain/Device";
import { ManagerResponse } from "../task/TaskManagerInterface";

export interface DeviceInterface {
  addDevice: (device: Device) => Promise<ManagerResponse<object|string>>;
  deleteDevice: (deviceId: string) => Promise<ManagerResponse<object|string>>;
 
}
