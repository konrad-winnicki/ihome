import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";

import {
  taskDocumentWithMockMetods,
} from "./mockForMongoTaskPersistence";
import { AggregatedTask } from "../../domain/AggregatedTask";
import { appCronMockMethods, prepareCronTaskManagerForDatabasePersistenceWithMockParameters } from "./mockForCronManager";

describe("cronTaskManager CLASS TEST - list all tasks", () => {
  let consoleSpy: SpiedFunction;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("Should list all tasks", async () => {
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

    const cronTaskManager = prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await cronTaskManager.listAll().then((res) => console.log("EEEEEEE", res));

    await cronTaskManager
      .listAll()
      .then((result) =>
        expect(result).toStrictEqual([
          new AggregatedTask("678910", true, 10, 56, "switch on", "switch off"),
        ])
      );
  });

  test("Should not list task if aggregated task array is empty", async () => {
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

    const cronTaskManager = prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await cronTaskManager
      .listAll()
      .then((result) => expect(result).toStrictEqual([]));
  });

  test("Should return error if error occured during aggregation", async () => {
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

    const cronTaskManager = prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
      appCron,
      taskDokumentMock
    );

    await cronTaskManager.listAll().catch((result) =>
      expect(result).toStrictEqual({
        "Persistence error": "Error during aggregation",
      })
    );
  });
});




