import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";


export type RepositoryResponse <T> = {
  [key:string]: T
}
export interface TaskRepository {
  add(task: Task): Promise<RepositoryResponse<object|string>>;
  delete(id: string): Promise<RepositoryResponse<object|string>>;
  findById: (taskId: string) => Promise<AggregatedTask>;
  getByDevice: (deviceId: string) => Promise<Task[]>;
  listAll: () => Promise<AggregatedTask[]>;
}
