import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";

import { taskDocumentWithMockMetods } from "./mockForMongoTaskPersistence";
import {
  appCronMockMethods,
  prepareCronTaskManagerForDatabasePersistenceWithMockParameters,
} from "./mockForCronManager";

describe("CronTaskManager with database persistence CLASS TEST - add task", () => {
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

    const cronTaskManager =
      prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
        appCron,
        taskDokumentMock
      );

    await cronTaskManager
      .add(taskToAdd)
      .then((result) => expect(result).toEqual({ taskId: "678910" }));
  });

  test("Should not add Task if adding to database failed", async () => {
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

    const cronTaskManager =
      prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
        appCron,
        taskDokumentMock
      );
/*
    await cronTaskManager
      .add(taskToAdd)
      .catch((err) => console.log("E____________", err));
*/
    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          "Task not added": "Adding to database failed",
        },
      })
    );
    
  });

  test("Should not add Task if task id exists", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "duplicatedId";
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

    const cronTaskManager =
      prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
        appCron,
        taskDokumentMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({ 'Task not added': { 'Task not added': { error: 'Duplicated id' } } })
    );
  });

  test("Should not add task and compensate if adding to cron failed", async () => {
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

    const cronTaskManager =
      prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
        appCron,
        taskDokumentMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          Error: "Internal cron error",
          compensation: {
            "Compensation succeded": {
              "Task deleted": { acknowledged: true, deletedCount: 1 },
            },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation succeded": {
        "Task deleted": { acknowledged: true, deletedCount: 1 },
      },
    });
  });

  test("Adding to cron fails, compensation fails", async () => {
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

    const cronTaskManager =
      prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
        appCron,
        taskDokumentMock
      );

    await cronTaskManager
      .add(taskToAdd)
      .catch((err) => console.log("EEEEEEEEEE", JSON.stringify(err)));

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          Error: "Internal cron error",
          compensation: {
            "Compensation failed": {
              "Task not deleted":
                "NOT deleted from database. Internal database error.",
            },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation failed": {
        "Task not deleted":
          "NOT deleted from database. Internal database error.",
      },
    });
  });

  test("Should not add tack and compensate if aggregation failed", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = "internalError";

    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus
    );

    const cronTaskManager =
      prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
        appCron,
        taskDokumentMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          Error: { error: "Error during aggregation" },
          compensation: {
            "Compensation succeded": {
              "Task deleted": { acknowledged: true, deletedCount: 1 },
            },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation succeded": {
        "Task deleted": { acknowledged: true, deletedCount: 1 },
      },
    });
  });

  test("Aggregation fails, compensation fails", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "error";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = "internalError";
    const findOneByIdStatus = "success";

    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus,
      findOneByIdStatus
    );

    const cronTaskManager =
      prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
        appCron,
        taskDokumentMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          Error: { error: "Error during aggregation" },
          compensation: {
            "Compensation failed": {
              "Task not deleted":
                "NOT deleted from database. Internal database error.",
            },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation failed": {
        "Task not deleted":
          "NOT deleted from database. Internal database error.",
      },
    });
  });

  test("Should not add task and compensate if aggregation returns empty array", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const deleteFromDBOptions = { acknowledged: true, deletedCount: 1 };
    const aggregateStatus = "emptyArray";

    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      deleteFromDBOptions,
      aggregateStatus
    );

    const cronTaskManager =
      prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
        appCron,
        taskDokumentMock
      );

    await cronTaskManager
      .add(taskToAdd)
      .catch((res) => console.log("DDDDD", JSON.stringify(res)));

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          Error: { error: { "Item not found": "Task not exists" } },

          compensation: {
            "Compensation succeded": {
              "Task deleted": { acknowledged: true, deletedCount: 1 },
            },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation succeded": {
        "Task deleted": { acknowledged: true, deletedCount: 1 },
      },
    });
  });
});
