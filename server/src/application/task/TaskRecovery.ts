import { ManagerResponse } from "./TaskManagerInterface";

export interface TaskRecovery {
  transformTaskFromDbToCron: () => Promise<ManagerResponse<object | string>>;
}
