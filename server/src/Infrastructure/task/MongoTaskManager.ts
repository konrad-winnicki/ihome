import { Task } from "../../domain/Task";
import { Model } from "mongoose";
import { TaskManagerInterface } from "../../application/task/TaskManagerInterface";
import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManagerInterface";

export class MongoTaskManager implements TaskManagerInterface {
  private taskDocument: Model<Task>;
  private serverMessages: ServerMessages;
  constructor(taskDocument: Model<Task>, serverMessages: ServerMessages) {
    this.taskDocument = taskDocument;
    this.serverMessages = serverMessages;
  }

  async addTask(task: Task): Promise<ManagerResponse<object>> {
    const newTask = {
      id: task.id,
      deviceId: task.deviceId,
      onStatus: task.onStatus,
      scheduledTime: task.scheduledTime,
    };

    return this.taskDocument
      .create(newTask)
      .then((task) => {
        const message = this.serverMessages.addTask.SUCCESS;
        return Promise.resolve({ [message]: task.id });
      })
      .catch((error) => {
        const message = this.serverMessages.addTask.FAILURE;
        const rejectMessage = { [message]: error };
        return Promise.reject(rejectMessage);
      });
  }

  async deleteTask(taskId: string): Promise<ManagerResponse<object>> {
    return this.taskDocument
      .deleteOne({ id: taskId })
      .then((response) => {
        const messageSucces = this.serverMessages.deleteTask.SUCCESS;
        const messageFailure = this.serverMessages.deleteTask.FAILURE;
        const resolveMessage = { [messageSucces]: response };
        const rejectMessage = { [messageFailure]: response };

        return response.acknowledged && response.deletedCount == 1
          ? Promise.resolve(resolveMessage)
          : Promise.reject(rejectMessage);
      })
      .catch((error) => {
        const messageFailure = this.serverMessages.deleteTask.FAILURE;
        const rejectMessage = { [messageFailure]: error };

        return Promise.reject(rejectMessage);
      });
  }
}
