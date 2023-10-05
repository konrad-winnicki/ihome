import { Task } from "../../domain/Task";

export interface CronTaskInterface {
    addTask: (task: Task) => Promise<string>;
    deleteTask: (taskId: string) => Promise<string>;
    transformTaskFromDbToCron: () => Promise<string | null>;
  }