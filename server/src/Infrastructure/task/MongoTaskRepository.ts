import { TaskRepository } from "../../application/task/TaskRepository";
import { Task } from "../../domain/Task";
import { Model, mongo } from "mongoose";
import { RepositoryResponse } from "../../application/task/TaskRepository";
import { ServerMessages } from "../../ServerMessages";


export class MongoTaskRepository implements TaskRepository {
  private taskDocument: Model<Task>;
  private serverMessages: ServerMessages;

  constructor(taskDocument: Model<Task>, serverMessages: ServerMessages) {
    this.taskDocument = taskDocument;
    this.serverMessages = serverMessages;
  }

  public async add(task: Task): Promise<RepositoryResponse<object>> {
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
        const errorToPass = error instanceof Error? this.translateDbError(error): error

        const message = this.serverMessages.addTask.FAILURE;
        const rejectMessage = { [message]: errorToPass };
        return Promise.reject(rejectMessage);

      });
  }


  private translateDbError(error: Error) {
    return error instanceof mongo.MongoServerError
      ? this.uniqueViolationErrorHandler(error)
      : { error: error.message };
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("name")) {
      return { error: this.serverMessages.uniqueViolation.NAME_DUPLICATION };
    }
    return { error: err.message };
  }
  public async delete(taskId: string): Promise<RepositoryResponse<object>> {
    const messageSucces = this.serverMessages.deleteTask.SUCCESS;
    const messageFailure = this.serverMessages.deleteTask.FAILURE;
    return this.taskDocument
      .deleteOne({ id: taskId })
      .then((databaseResponse) => {
        const resolveMessage = { [messageSucces]: databaseResponse };
        const rejectMessage = { [messageFailure]: databaseResponse };

        return databaseResponse.acknowledged &&
          databaseResponse.deletedCount == 1
          ? Promise.resolve(resolveMessage)
          : Promise.reject(rejectMessage);
      })
      .catch((error) => {
        const rejectMessage = { [messageFailure]: error };

        return Promise.reject(rejectMessage);
      });
  }

  public async findById(taskId: string): Promise<Task> {
        return this.taskDocument
      .findOne({ id: taskId })
      .then((task) => {
        if (task) {
          return Promise.resolve(
            new Task(task.id, task.deviceId, task.onStatus, task.scheduledTime)
          );
        } else {
          return Promise.reject(`Task not exists`);
        }
      })
      .catch((error) => {
        return Promise.reject({ error: error });
      });
  }

  public async listAll(): Promise<Task[]> {
    return this.taskDocument.find({})
      .then((tasks) => {
        return Promise.resolve(tasks as Task[]);
      })
      .catch((error) => {
        const persistenceError = this.serverMessages.persistenceError;
        return Promise.reject({ [persistenceError]: error })});
  }

  public async getByDevice(deviceId: string): Promise<Task[]> {
    const databaseError = this.serverMessages.persistenceError;
    return this.taskDocument
      .find({ deviceId: deviceId })
      .then((tasks) => tasks)
      .catch((error) => Promise.reject({ [databaseError]: error }));
  }
}
