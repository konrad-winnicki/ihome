import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";

export interface DBTaskInterface {
  addTask: (task: Task) => Promise<string>;
  deleteTask: (taskId: string) => Promise<string>;
  findTaskById: (taskId: string) => Promise<AggregatedTask | null>;
  findTasksForDevice: (deviceId: string) => Promise<Task[] | null>;
  findAllTask: () => Promise<AggregatedTask[] | null>;
}

