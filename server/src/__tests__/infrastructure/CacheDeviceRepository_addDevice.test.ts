import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";
import {
  AddToDatabaseStatus,
  DeleteFromDBStatus,
  FindOneById,
  deviceDocumentWithMockMetods,
  prepareMongoDeviceRepositoryWithMockPerameters,
} from "./mockForMongoDevicePersistence";
import {
  MemeoryStatusType,
  inMemoryStoreWithMockMethods,
  prepareCacheDeviceRepositoryWithMockPerameters,
} from "./mockForCacheDeviceRepository";

describe("CacheDeviceReposiotory with database persistence CLASS TEST - add device", () => {
  const dependency = (
    addToMemoryStatus: MemeoryStatusType,
    deleteFromMemoryStatus: MemeoryStatusType,
    addToDBStatus: AddToDatabaseStatus,
    deleteFromDBStatus: DeleteFromDBStatus,
    findOneByIdStatus: FindOneById

  ) => {
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus
    );

    const mongoDeviceRepository =
      prepareMongoDeviceRepositoryWithMockPerameters(deviceDokumentMock);

    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        mongoDeviceRepository
      );
    return cacheDeviceRepository;
  };

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
    const deleteFromDBStatus = undefined;
    const findOneByIdStatus = undefined;

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus 
    );

    await cacheDeviceRepository
      .add(deviceToAdd)
      .then((result) => expect(result).toEqual({ deviceId: "12345" }));
  });

  test("Should not add device if not added to database", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "error";
    const deleteFromDBStatus = undefined;
    const findOneByIdStatus = undefined;

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus 
    );

    await cacheDeviceRepository.add(deviceToAdd).catch((result) =>
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
    const findOneByIdStatus = undefined;

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus 
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
    const findOneByIdStatus = undefined;

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus 
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
