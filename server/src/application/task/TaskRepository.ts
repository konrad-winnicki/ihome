import { Task } from "../../domain/Task";

export type RepositoryResponse<T> = {
  [key: string]: T;
};
export interface TaskRepository {
  add(task: Task): Promise<RepositoryResponse<object | string>>;
  delete(id: string): Promise<RepositoryResponse<object | string>>;
  getByDevice: (deviceId: string) => Promise<Task[]>;
  listAll: () => Promise<Task[]>;
  findById(taskId: string): Promise<Task>;


}
