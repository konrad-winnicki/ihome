import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";

export interface DBTaskInterface {
  addTask: (task: Task) => Promise<string>;
  deleteTask: (taskId: string) => Promise<string>;
  findTaskById: (taskId: string) => Promise<AggregatedTask>;
  findTasksForDevice: (deviceId: string) => Promise<Task[]>;
  findAllTask: () => Promise<AggregatedTask[]>;
}

