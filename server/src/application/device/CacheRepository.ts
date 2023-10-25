import { Device } from "../../domain/Device";
import { ManagerResponse } from "../task/TaskManagerInterface";

export interface CacheRepository {
  add: (device: Device) => Promise<ManagerResponse<object | string>>;
  delete: (deviceId: string) => Promise<ManagerResponse<object | string>>;
}
