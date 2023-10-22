import { Task } from "../../domain/Task";

export interface TaskManagerInterface {
  addTask: (task: Task) => Promise<string>;
  deleteTask: (taskId: string) => Promise<string>;
}
