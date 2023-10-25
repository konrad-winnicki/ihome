import { AggregatedTask } from "../../domain/AggregatedTask";

export type ManagerResponse<T> = {
  [key: string]: T;
};

export interface TaskManager {
  add: (aggregatedTask: AggregatedTask) => Promise<ManagerResponse<object | string>>;
  delete: (taskId: string) => Promise<ManagerResponse<object | string>>;
}
