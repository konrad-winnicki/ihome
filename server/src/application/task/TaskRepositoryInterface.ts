import { Task } from "../../domain/Task";
import { TaskManager } from "./TaskManagerInterface";


export interface TaskRepository extends TaskManager {
  findById(taskId: string): Promise<Task>;
}
