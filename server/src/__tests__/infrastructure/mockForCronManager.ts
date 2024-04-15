import { Model } from "mongoose";
import { CronTaskManager } from "../../application/task/CronTaskManager";
import { MongoTaskRepository } from "../../infrastructure/database/MongoTaskRepository";
import { ServerMessages } from "../../ServerMessages";
import { TaskScheduler } from "../../infrastructure/cache/TaskScheduler";
import { Task } from "../../domain/Task";
import { FileTaskRepository } from "../../infrastructure/file/FileTaskRepository";
import { FileRepositoryHelpers } from "../../infrastructure/file/auxilaryFunctions";
import { DeviceRunService } from "../../application/device/DeviceRunService";
import { CachedDevice } from "../../infrastructure/cache/CachedDevices";

export function prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
  appCron: TaskScheduler,
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
  appCron: TaskScheduler,
  helperMethods: FileRepositoryHelpers
) {
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
  const cachedDevices = CachedDevice.getInstance();
  const deviceRunService = new DeviceRunService(cachedDevices);
  const appCron = new TaskScheduler(deviceRunService);

  const mockAdd = jest.fn().mockImplementation(async () => {
    switch (addToCronStatus) {
      case "success":
        return Promise.resolve({ taskId: "678910" });
      case "error":
        //throw new Error("Internal cron error");
        return Promise.reject("Internal cron error");
    }
  });

  const mockDelete = jest.fn().mockImplementation(() => {
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

  appCron.add = mockAdd;
  appCron.delete = mockDelete;
  return appCron;
}
