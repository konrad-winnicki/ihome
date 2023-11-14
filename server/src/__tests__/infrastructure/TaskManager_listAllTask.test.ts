import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";

import {
  taskDocumentWithMockMetods,
} from "./mockForMongoTaskPersistence";
import { appCronMockMethods, prepareCronTaskManagerForDatabasePersistenceWithMockParameters } from "./mockForCronManager";
import { MemeoryStatusType } from "./mockForCacheDeviceRepository";
import { AddToDatabaseStatus, DeleteFromDBStatus, FindOneById } from "./mockForMongoDevicePersistence";

describe("cronTaskManager CLASS TEST - list all tasks", () => {
  const dependency = (
    addToCronStatus: MemeoryStatusType,
    deleteFromCronStatus: MemeoryStatusType,
    addToDBStatus: AddToDatabaseStatus,
    deleteFromDBStatus: DeleteFromDBStatus,
    findOneByIdStatus: FindOneById
  ) => {
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    const taskDokumentMock = taskDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus
    );

    const cronTaskManager =
      prepareCronTaskManagerForDatabasePersistenceWithMockParameters(
        appCron,
        taskDokumentMock
      );

    return cronTaskManager;
  };
 

  test("Should list all tasks", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const findOneByIdStatus = undefined

    const cronTaskManager = dependency (
      addToCronStatus,
      deleteFromCronStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus)

    await cronTaskManager
      .listAll()
      .then((result) =>
        expect(result).toStrictEqual([
          {id: '678910',
            deviceId: '12345',
            onStatus: true,
            scheduledTime: { hour: '10', minutes: '10' }}])
      );
  });

});




