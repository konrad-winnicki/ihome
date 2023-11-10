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

describe("CacheDeviceReposiotory with database persistence CLASS TEST - delete device", () => {
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
  
  
  
  
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });
  test("Should delete device from database and memory", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const findOneByIdStatus = "success";
    
    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus 
    );

    await cacheDeviceRepository
      .delete("12345")
      .then((result) =>
        expect(result).toEqual({ "Device deleted": "No errors" })
      );

    expect(consoleSpy).not.toHaveBeenCalledWith({
      "Compensation succeded": { deviceId: "12345" },
    });
  });

  test("Should not delete device if device not exists", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const findOneByIdStatus = null;
    
    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus 
    );

    await cacheDeviceRepository.delete("12345").catch((result) =>
      expect(result).toEqual({
        "Device not deleted": {
          "Persistence error": {
            NonExistsError: "Device with id 12345 does not exist.",
          },
        },
      })
    );
    expect(consoleSpy).not.toHaveBeenCalledWith({
      "Compensation succeded": { deviceId: "12345" },
    });
  });

  test("Should not delete device if findById error", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const findOneByIdStatus = "error";
    
    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus 
    );

    await cacheDeviceRepository.delete("12345").catch((result) =>
      expect(result).toEqual({
        "Device not deleted": {
          "Persistence error": "Item not found",
        },
      })
    );

    expect(consoleSpy).not.toHaveBeenCalledWith({
      "Compensation succeded": { deviceId: "12345" },
    });
  });

  test("Should not delete device and do compensation if not deleted from memory", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "error";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const findOneByIdStatus = "success";
    
    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus 
    );

    await cacheDeviceRepository.delete("12345").catch((result: object) => {
      console.log(JSON.stringify(result));
      expect(result).toEqual({
        "Device not deleted": {
          error: "Deletion from storage failed",
          compensation: {
            "Compensation succeded": {
              deviceId: "12345",
            },
          },
        },
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation succeded": { deviceId: "12345" },
    });
  });

  test("Should not delete if not deleted from database", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "error";
    const findOneByIdStatus = "success";
    
    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus 
    );

    await cacheDeviceRepository.delete("12345").catch((result: object) => {
      console.log(JSON.stringify(result));
      expect(result).toEqual({
        "Device not deleted": {
          "Device not deleted": "NOT deleted from database",
        },
      });
    });
    expect(consoleSpy).not.toHaveBeenCalledWith({
      "Compensation succeded": { deviceId: "12345" },
    });
  });

  test("Compensation should fail if adding to database fails", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "error";
    const addToDBStatus = "error";
    const deleteFromDBStatus = "success";
    const findOneByIdStatus = "success";
    
    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus 
    );

    await cacheDeviceRepository.delete("12345").catch((result: object) => {
      console.log(JSON.stringify(result));
      expect(result).toEqual({
        "Device not deleted": {
          error: "Deletion from storage failed",
          compensation: {
            "Compensation failed": {
              "Device not added": { error: "Adding to database failed" },
            },
          },
        },
      });
    });
    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation failed": {
        "Device not added": { error: "Adding to database failed" },
      },
    });
  });
});
