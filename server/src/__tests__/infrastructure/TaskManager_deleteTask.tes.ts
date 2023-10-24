/*
import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";

import {
  appCronMockMethods,
  taskDocumentWithMockMetods,
  prepareTaskManagerWithMockParameters,
} from "./mockForTaskManager";

describe("TaskManager CLASS TEST - delete task", () => {
  const taskId = "678910";
  let consoleSpy: SpiedFunction;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("Should delete device", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = "success";
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus
    );

    const taskManager = prepareTaskManagerWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await taskManager
      .deleteTask(taskId)
      .then((result) => expect(result).toMatch("Task 678910 deleted"));

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Task restoration in memory succeded"
    );
  });

  test("Should not delete device if database error during deletion", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "error";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = "success";
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus
    );

    const taskManager = prepareTaskManagerWithMockParameters(
      appCron,
      taskDokumentMock
    );
    await taskManager
      .deleteTask(taskId)
      .catch((err) =>
        expect(err).toMatch(
          "Task deletion failed due to error: Task restoration to cron succeded, Task not deleted due database error: NOT deleted from database. Server error."
        )
      );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Task restoration to cron succeded"
    );
  });

  test("Should not delete device if deletion from database failed", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: false, deletedCount: 0 };
    const aggregateStatus = "success";
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus
    );

    const taskManager = prepareTaskManagerWithMockParameters(
      appCron,
      taskDokumentMock
    );
    await taskManager
      .deleteTask(taskId)
      .catch((err) =>
        expect(err).toMatch(
          "Task deletion failed due to error:  Task not deleted due database error: Task with 678910 not exists, Task restoration to cron succeded"
        )
      );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Task restoration to cron succeded"
    );
  });

  test("Should not delete device if deletion from cron failed", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "error";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = "success";
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus
    );

    const taskManager = prepareTaskManagerWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await taskManager
      .deleteTask(taskId)
      .catch((err) =>
        expect(err).toMatch(
          "Task not deleted due to error: Cron error during deletion."
        )
      );

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Task restoration to cron succeded"
    );
  });

  test("Should not delete device if task not exists in cron", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "nonExistingId";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = "success";
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus
    );

    const taskManager = prepareTaskManagerWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await taskManager
      .deleteTask(taskId)
      .catch((err) =>
        expect(err).toMatch(
          "Task not deleted due to error: Task does not exist."
        )
      );

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Task restoration to cron succeded"
    );
  });

  test("Compensation failed if addition to Cron not succeded", async () => {
    const addToCronStatus = "error";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "error";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = "success";
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus
    );

    const taskManager = prepareTaskManagerWithMockParameters(
      appCron,
      taskDokumentMock
    );
    await taskManager
      .deleteTask(taskId)
      .catch((err) =>
        expect(err).toMatch(
          "Task deletion failed due to error: Task not deleted due database error: NOT deleted from database. Server error. Task restoration to cron failed due error: Error: Internal cron error"
        )
      );

    expect(consoleSpy).toHaveBeenCalledWith("Task restoration to cron failed.");
  });
  
  test("Should not delete if deletion from memory failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "error";
    const addToDBStatus = "error";
    const deleteFromDBStatus = "error";

    const inMemoryStorageMock = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceManager = prepareMongoDeviceManagerWithMockPerameters(
      inMemoryStorageMock,
      deviceDokumentMock
    );

    await mongoDeviceManager
    .deleteDevice(deviceId)
    .catch((err) =>
      expect(err).toMatch(
        "Deletion failed due error: Error: Deletion from storage failed"
      )
    );

  
    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Delete device compensation succeeded."
    );
  });

  
});
*/