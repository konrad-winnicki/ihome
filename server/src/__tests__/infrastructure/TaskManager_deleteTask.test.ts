import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";

import {
  taskDocumentWithMockMetods,
} from "./mockForMongoTaskPersistence";
import { appCronMockMethods, prepareCronTaskManagerForDatabasePersistenceWithMockParameters} from "./mockForCronManager";

describe("cronTaskManager with database persistence CLASS TEST - delete task", () => {
  const taskId = "678910";
  let consoleSpy: SpiedFunction;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("Should delete task", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const findOneByIdStatus = "success";
    const aggregateStatus = undefined;

    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus,
      findOneByIdStatus
    );

    const cronTaskManager = prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await cronTaskManager
      .delete(taskId)
      .then((result) =>
        expect(result).toEqual({ "Task deleted": "No errors" })
      );
  });

  test("Should not delete task if database error during deletion", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "error";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = undefined;
    const findOneByIdStatus = "success";

    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus,
      findOneByIdStatus
    );

    const cronTaskManager = prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await cronTaskManager.delete(taskId).catch((result) =>
      expect(result).toEqual({
        "Task not deleted": {
          "Task not deleted":
            "NOT deleted from database. Internal database error.",
        },
      })
    );
  });

  test("Should not delete task and compensate if cron error during deletion", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "error";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = undefined;
    const findOneByIdStatus = "success";

    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus,
      findOneByIdStatus
    );

    const cronTaskManager = prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await cronTaskManager.delete(taskId).catch((result) =>
      expect(result).toEqual({
        "Task not deleted": {
          error: "Cron error during deletion.",
          compensation: {
            error: "Cron error during deletion.",
            compensation: { "Compensation succeded": { taskId: "678910" } },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation succeded": { taskId: "678910" },
    });
  });

  test("Deletion from cron cron fails, compensation fails", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "error";
    const addToDBStatus = "error";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = undefined;
    const findOneByIdStatus = "success";

    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus,
      findOneByIdStatus
    );

    const cronTaskManager = prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await cronTaskManager.delete(taskId).catch((result) =>
      expect(result).toEqual({
        "Task not deleted": {
          error: "Cron error during deletion.",
          compensation: {
            "Compensation failed": {
              "Task not added": "Adding to database failed",
            },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation failed": {
        "Task not added": "Adding to database failed",
      },
    });
  });

  test("Should not delete task if task not exists", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = undefined;
    const findOneByIdStatus = null;

    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus,
      findOneByIdStatus
    );

    const cronTaskManager = prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await cronTaskManager.delete(taskId).catch((result) =>
      expect(result).toEqual({
        "Task not deleted": { error: "Task not exists" },
      })
    );
  });

  test("Should not delete task if database error during searchinf for task", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = undefined;
    const findOneByIdStatus = "error";

    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus,
      findOneByIdStatus
    );

    const cronTaskManager = prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await cronTaskManager.delete(taskId).catch((result) =>
      expect(result).toEqual({
        "Task not deleted": { error: "Internal database error" },
      })
    );
  });
});
