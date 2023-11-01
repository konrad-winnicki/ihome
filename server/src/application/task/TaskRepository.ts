import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";

export type RepositoryResponse<T> = {
  [key: string]: T;
};
export interface TaskRepository {
  findById(taskId: string): Promise<Task>;
  add(task: Task): Promise<RepositoryResponse<object | string>>;
  delete(id: string): Promise<RepositoryResponse<object | string>>;
  findByIdAndAggregate: (taskId: string) => Promise<AggregatedTask>;
  getByDevice: (deviceId: string) => Promise<Task[]>;
  listAll: () => Promise<AggregatedTask[]>;
}
