import { Device } from "../../domain/Device";
import { ManagerResponse } from "../task/TaskManager";

export interface CacheRepository {
  add: (device: Device) => Promise<ManagerResponse<object | string>>;
  delete: (deviceId: string) => Promise<ManagerResponse<object | string>>;
}
