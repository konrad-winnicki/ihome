import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";

export type ManagerResponse<T> = {
  [key: string]: T;
};

export interface TaskManager {
  add: (task: Task) => Promise<ManagerResponse<object | string>>;
  delete: (taskId: string) => Promise<ManagerResponse<object | string>>;
  getByDevice: (deviceId: string) => Promise<Task[]>;
  listAll: () => Promise<AggregatedTask[]>;

}
