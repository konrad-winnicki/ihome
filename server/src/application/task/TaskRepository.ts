import { AggregatedTask } from "../../domain/AggregatedTask";
import { Task } from "../../domain/Task";
import { TaskManagerInterface } from "./TaskManagerInterface";

export interface TaskRepository extends TaskManagerInterface {
  findTaskById: (taskId: string) => Promise<AggregatedTask>;
  findTasksForDevice: (deviceId: string) => Promise<Task[]>;
  findAllTask: () => Promise<AggregatedTask[]>;
}
