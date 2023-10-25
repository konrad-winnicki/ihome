import { ManagerResponse } from "./TaskManager";

export interface TaskRecovery {
  transformTaskFromDbToCron: () => Promise<ManagerResponse<object | string>>;
}
