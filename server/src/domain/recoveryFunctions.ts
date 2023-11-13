import { TaskRecovery } from "../application/task/TaskRecovery";

export async function recoverTasks(taskRecoveryManager: TaskRecovery) {
  return taskRecoveryManager
    .transformTaskFromDbToCron()
    .then((result) => console.log(result))
    .catch((error) => console.log(error));
  //TODO: what when server restart but this fails?
}
