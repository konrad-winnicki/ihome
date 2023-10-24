/*import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";

import {
  appCronMockMethods,
  prepareTaskManagerWithMockParameters,
  taskDocumentWithMockMetods,
} from "./mockForTaskManager";

describe("TaskManager CLASS TEST", () => {
  let consoleSpy: SpiedFunction;
  const taskToAdd = {
    id: "678910",
    deviceId: "12345",
    onStatus: true,
    scheduledTime: { hour: "10", minutes: "45" },
  };

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("Should add task to cron and database", async () => {
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
      .addTask(taskToAdd)
      .then((result) => expect(result).toMatch("678910"));

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Should not add device if adding to database failed", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "error";
    const deleteFromDBStatus = "success";
    const aggregateStatus = "success";

    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
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
      .addTask(taskToAdd)
      .catch((err) =>
        expect(err).toMatch(
          "Task not added due to error: Adding to database failed"
        )
      );

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Task add compensation succeded"
    );
  });

  test("Should not add task if adding to cron failed", async () => {
    const addToCronStatus = "error";
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
      .addTask(taskToAdd)
      .catch((err) =>
        expect(err).toMatch(
          "Task not added due to error: Error: Internal cron error, Compensation succeeded: Task 678910 deleted"
        )
      );

    expect(consoleSpy).toHaveBeenCalledWith("Add task compensation succeded.");
    expect(consoleSpy).not.toHaveBeenCalledWith(
      " Add task compensation failed."
    );
  });

  test("Compensation fails if task not existing in database: not aggregated", async () => {
    const addToCronStatus = "error";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: false, deletedCount: 0 };
    const aggregateStatus = "taskNotExists";

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
      .addTask(taskToAdd)
      .catch((err) =>
        expect(err).toMatch(
          "Task not added due to error: Task with 678910 not exists, Task add compensation failed due to error: Task not deleted due database error: Task with 678910 not exists"
        )
      );
    expect(consoleSpy).toHaveBeenCalledWith("Add task compensation failed.");
  });

  test("Compensation fails if task not existing in database: not aggregated and deletion error", async () => {
    const addToCronStatus = "error";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "error";
    const deleteFromDBOptions = { acknowledged: false, deletedCount: 0 };
    const aggregateStatus = "taskNotExists";

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
      .addTask(taskToAdd)
      .catch((err) =>
        expect(err).toMatch(
          "Task not added due to error: Task with 678910 not exists, Task add compensation failed due to error: Task not deleted due database error: NOT deleted from database. Server error."
        )
      );
    expect(consoleSpy).toHaveBeenCalledWith("Add task compensation failed.");
  });
});
*/