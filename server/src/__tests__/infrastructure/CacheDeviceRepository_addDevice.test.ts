import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";
import {
  deviceDocumentWithMockMetods,
  prepareMongoDeviceRepositoryWithMockPerameters,
} from "./mockForMongoDevicePersistence";
import { inMemoryStoreWithMockMethods, prepareCacheDeviceRepositoryWithMockPerameters } from "./mockForCacheDeviceRepository";

describe("CacheDeviceReposiotory with database persistence CLASS TEST - add device", () => {
  const deviceToAdd = {
    id: "12345",
    deviceType: "switch",
    name: "switch1",
    commandOn: "switch on",
  };

  test("Should add device to database", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "success";

    const deviceDokumentMock = deviceDocumentWithMockMetods(addToDBStatus);

    const mongoDeviceRepository =
      prepareMongoDeviceRepositoryWithMockPerameters(deviceDokumentMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        mongoDeviceRepository
      );

    await cacheDeviceRepository
      .add(deviceToAdd)
      .then((result) => expect(result).toEqual({ deviceId: "12345" }));
  });

  test("Should not add device if not added to database", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "error";

    const deviceDokumentMock = deviceDocumentWithMockMetods(addToDBStatus);

    const mongoDeviceRepository =
      prepareMongoDeviceRepositoryWithMockPerameters(deviceDokumentMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        mongoDeviceRepository
      );

    await cacheDeviceRepository
      .add(deviceToAdd)
      .catch((result) =>
        expect(result).toEqual({
          "Device not added": { error: "Adding to database failed" },
        })
      );
  });

  test("Should not add device and compensate if not added to cache", async () => {
    const addToMemoryStatus = "error";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceRepository =
      prepareMongoDeviceRepositoryWithMockPerameters(deviceDokumentMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        mongoDeviceRepository
      );

    await cacheDeviceRepository
      .add(deviceToAdd)
      .catch((result) => console.log(result))
      .catch((result) =>
        expect(result).toStrictEqual({
          Error: "Adding to storage failed",
          compensation: {
            "Compensation succeded": { "Device deleted": "No errors" },
          },
        })
      );
  });

  test("Compansation should fail", async () => {
    const addToMemoryStatus = "error";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "error";

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceRepository =
      prepareMongoDeviceRepositoryWithMockPerameters(deviceDokumentMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        mongoDeviceRepository
      );

    await cacheDeviceRepository
      .add(deviceToAdd)
      .catch((result) => console.log(result))
      .catch((result) =>
        expect(result).toStrictEqual({
          Error: "Adding to storage failed",
          compensation: {
            "Compensation failed": {
              "Device not deleted": "NOT deleted from database",
            },
          },
        })
      );
  });

});
