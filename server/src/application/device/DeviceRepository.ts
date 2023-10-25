import { Device } from "../../domain/Device";

export interface DeviceRepository {
  add(device: Device): Promise<void>;
  delete(id: string): Promise<void>;
  listByType(deviceType: string): Promise<Device[]>;
  getById(id: string): Promise<Device>;
}
