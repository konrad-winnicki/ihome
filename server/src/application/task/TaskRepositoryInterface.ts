import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";

export interface TaskRepositoryInterface  {
  findTaskById: (taskId: string) => Promise<AggregatedTask>;
  findTasksForDevice: (deviceId: string) => Promise<Task[]>;
  findAllTask: () => Promise<AggregatedTask[]>;
}
