/*
import { Model } from "mongoose";
import { Device } from "../../domain/Device";
import { EventEmitter } from "koa";
import { AppCron } from "../../domain/AppCron";
import { MongoTaskManager } from "../../Infrastructure/task/MongoTaskManager";
import { Task } from "../../domain/Task";
import { CronTaskManager } from "../../Infrastructure/task/CronTaskManager";
import { TaskManager } from "../../Infrastructure/task/TaskManager";

export function prepareTaskManagerWithMockParameters(
  appCron: AppCron,
  taskDocument: Model<Task>
) {
  const eventEmitter = new EventEmitter();

  const mongoTaskManager = new MongoTaskManager(taskDocument);
  const cronTaskManager = new CronTaskManager(mongoTaskManager, appCron);

  const taskManager = new TaskManager(cronTaskManager, eventEmitter);

  return taskManager;
}

export function appCronMockMethods(
  addToCronStatus: string,
  deleteFromCronStatus: string
) {
  const appCron = new AppCron();

  const mockInstallTask = jest.fn().mockImplementation(() => {
    switch (addToCronStatus) {
      case "success":
        return Promise.resolve();
      case "error":
        throw new Error("Internal cron error");
    }
  });

  const mockDeleteTask = jest.fn().mockImplementation(() => {
    switch (deleteFromCronStatus) {
      case "success":
        return Promise.resolve("Task deleted");
      case "error":
        return Promise.reject("Cron error during deletion.");
      case "nonExistingId":
        return Promise.reject("Task does not exist.");
    }
  });

  appCron.installTask = mockInstallTask;
  appCron.deleteTask = mockDeleteTask;
  return appCron;
}

export function taskDocumentWithMockMetods(
  addToDBStatus: string,
  deleteFromDBStatus: string,
  deleteFromDBOptions: object,
  aggregateStatus: string
) {
  const databaseCreateMock = jest.fn().mockImplementation((device: Device) => {
    switch (addToDBStatus) {
      case "success":
        return Promise.resolve(device);
      case "error":
        return Promise.reject("Adding to database failed");
    }
  });

  const databaseDeleteOneMock = jest.fn().mockImplementation(() => {
    switch (deleteFromDBStatus) {
      case "success":
        return Promise.resolve(deleteFromDBOptions);
      case "error":
        return Promise.reject("NOT deleted from database. Server error.");
    }
  });

  const aggregateMock = jest.fn().mockImplementation(() => {
    switch (aggregateStatus) {
      case "success":
        return Promise.resolve([
          {
            id: "678910",
            onStatus: true,
            scheduledTime: { hour: "10", minutes: "56" },
            device: { commandOn: "switch on", commandOff: "switch off" },
          },
        ]);
      case "taskNotExists":
        return Promise.resolve([]);
    }
  });

  const taskDokumentMock = {
    create: databaseCreateMock,
    deleteOne: databaseDeleteOneMock,
    aggregate: aggregateMock,
  } as unknown as Model<Task>;

  return taskDokumentMock;
}
*/