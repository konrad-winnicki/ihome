import { TaskManagerInterface } from "./TaskManagerInterface";

export interface CronTaskInterface extends TaskManagerInterface {
  transformTaskFromDbToCron: () => Promise<string>;
}
