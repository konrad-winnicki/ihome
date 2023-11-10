import { Model } from "mongoose";
import { CronTaskManager } from "../../Infrastructure/task/CronTaskManager";
import { MongoTaskRepository } from "../../Infrastructure/task/MongoTaskRepository";
import { ServerMessages } from "../../ServerMessages";
import { AppCron } from "../../domain/AppCron";
import { Task } from "../../domain/Task";
import { FileTaskRepository } from "../../Infrastructure/filePersistencia/FileTaskRepository";
import { FileRepositoryHelpers } from "../../Infrastructure/filePersistencia/auxilaryFunctions";

export function prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
  appCron: AppCron,
  taskDocument: Model<Task>
) {
  const serverMessages = new ServerMessages();
  const mongoTaskManager = new MongoTaskRepository(
    taskDocument,
    serverMessages
  );
  const cronTaskManager = new CronTaskManager(
    appCron,
    mongoTaskManager,
    serverMessages
  );

  return cronTaskManager;
}

export function prepareCronTaskManagerForFilePersistenceWithMockParameters(
  appCron: AppCron,
  helperMethods: FileRepositoryHelpers){
  const serverMessages = new ServerMessages();

  const fileTaskRepository = new FileTaskRepository(
    helperMethods,
    serverMessages
  );
  const cronTaskManager = new CronTaskManager(
    appCron,
    fileTaskRepository,
    serverMessages
  );

  //const taskManager = new TaskManager(cronTaskManager, eventEmitter);

  return cronTaskManager;
}

export function appCronMockMethods(
  addToCronStatus: string,
  deleteFromCronStatus: string
) {
  const appCron = new AppCron();

  const mockInstallTask = jest.fn().mockImplementation(() => {
    switch (addToCronStatus) {
      case "success":
        return Promise.resolve({ taskId: "678910" });
      case "error":
        throw new Error("Internal cron error");
    }
  });

  const mockDeleteTask = jest.fn().mockImplementation(() => {
    console.log("delete from cron", deleteFromCronStatus);
    switch (deleteFromCronStatus) {
      case "success":
        return Promise.resolve({ ["Task deleted"]: "No errors" });
      case "error":
        return Promise.reject("Cron error during deletion.");
      case "nonExistingId":
        return Promise.reject({
          error: `Task with id ${"678910"} doesn't exist.`,
        });
    }
  });

  appCron.installTask = mockInstallTask;
  appCron.deleteTask = mockDeleteTask;
  return appCron;
}
