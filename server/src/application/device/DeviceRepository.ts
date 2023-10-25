import { Device } from "../../domain/Device";
import { ManagerResponse } from "../task/TaskManager";

export interface DeviceRepository {
  add: (device: Device) => Promise<ManagerResponse<object | string>>;
  delete: (deviceId: string) => Promise<ManagerResponse<object | string>>;
  listByType(deviceType: string): Promise<Device[]>;
  getById(id: string): Promise<Device>;
}
