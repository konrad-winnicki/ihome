import { Task } from "../../domain/Task";

export type ManagerResponse <T> = {
  [key:string]: T
}

export interface TaskManagerInterface {
  addTask: (task: Task) => Promise<ManagerResponse<object|string>>;
  deleteTask: (taskId: string) => Promise<ManagerResponse<object|string>>;
}
