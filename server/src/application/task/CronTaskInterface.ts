import { ManagerResponse } from "./TaskManagerInterface";


export interface CronTaskInterface {
  transformTaskFromDbToCron: () => Promise<ManagerResponse<object|string>>;
}
