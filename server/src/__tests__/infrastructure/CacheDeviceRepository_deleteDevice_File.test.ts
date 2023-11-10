import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";

import {
  MemeoryStatusType,
  inMemoryStoreWithMockMethods,
  prepareCacheDeviceRepositoryWithMockPerameters,
} from "./mockForCacheDeviceRepository";
import { FileRepositoryHelpers } from "../../Infrastructure/filePersistencia/auxilaryFunctions";
import { prepareFileDeviceRepositoryWithMockPerameters } from "./mockForFileDevicePersistence";
import {
  DeviceTaskError,
  EmptyObject,
  ReadFileMockReturnValues,
  fsModuleMockForDevices,
} from "./mockForFileRepositoryHeplers";

describe("CacheDeviceReposiotory with file persistence CLASS TEST - delete device", () => {
  const dependency = (
    addToMemoryStatus: MemeoryStatusType,
    deleteFromMemoryStatus: MemeoryStatusType,
    writeFileMockImplementationCalls: DeviceTaskError[],
    readFileMockImplemenmtationCalls: DeviceTaskError[],
    readFileMockReturnValues: (ReadFileMockReturnValues | EmptyObject)[]
  ) => {
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );

    fsModuleMockForDevices(
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
    );
    const helperMock = new FileRepositoryHelpers();

    const fileDeviceRepository =
      prepareFileDeviceRepositoryWithMockPerameters(helperMock);

    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        fileDeviceRepository
      );

    return cacheDeviceRepository;
  };

  const deviceMockValue = {
    "12345": {
      id: "12345",
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
      commandOff: "switch off",
    },
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
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplemenmtationCalls = ["device", "device"] as DeviceTaskError[];
    const readFileMockReturnValues = [deviceMockValue, deviceMockValue];


    
    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository
      .delete("12345")
      .then((result) =>
        expect(result).toEqual({ "Device deleted": "No errors" })
      );
  });

  test("Should not delete device if device not exists", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = ["write", "write"] as DeviceTaskError[];
    const readFileMockImplemenmtationCalls = ["device"] as DeviceTaskError[];

    const deviceWithNonExistingItem = {
      nonExistingID: {
        id: "nonExistingID",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    };
    const readFileMockReturnValues = [deviceWithNonExistingItem];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
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
  });

  test("Should not delete device if reading from file error during finding item", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = ["write"] as DeviceTaskError[];
    const readFileMockImplemenmtationCalls = ["error"] as DeviceTaskError[];
    const readFileMockReturnValues = [deviceMockValue];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
    );
    await cacheDeviceRepository.delete("12345").catch((result) =>
      expect(result).toEqual({
        "Device not deleted": {
          "Persistence error": {
            "Read file error": "Internal read error",
          },
        },
      })
    );
  });

  test("Should not delete device if reading from file error during finding item", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = ["error"] as DeviceTaskError[];
    const readFileMockImplemenmtationCalls = ["device"] as DeviceTaskError[];
    const readFileMockReturnValues = [deviceMockValue];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
    );
    await cacheDeviceRepository.delete("12345").catch((result) =>
      expect(result).toEqual({
        "Device not deleted": {
          "Persistence error": {
            "Write file error": "Internal write error",
          },
        },
      })
    );
  });

  test("Should not delete device and do compensation if not deleted from memory", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "error";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplemenmtationCalls = ["device", "device", "device"] as DeviceTaskError[];
    const readFileMockReturnValues = [deviceMockValue, deviceMockValue, {}];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.delete("12345").catch((result) => {
      expect(result).toEqual({
        "Device not deleted": {
          error: "Deletion from storage failed",
          compensation: { "Compensation succeded": { deviceId: "12345" } },
        },
      });
    });
  });

  test("Should not delete if reading from file failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = ["write", "write"] as DeviceTaskError[];
    const readFileMockImplemenmtationCalls = ["error"] as DeviceTaskError[];
    const readFileMockReturnValues = [deviceMockValue];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.delete("12345").catch((result) => {
      expect(result).toEqual({
        "Device not deleted": {
          "Persistence error": { "Read file error": "Internal read error" },
        },
      });
    });
  });

  test("Should not delete if writing to file failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = ["error"] as DeviceTaskError[];
    const readFileMockImplemenmtationCalls = ["device"] as DeviceTaskError[];
    const readFileMockReturnValues = [deviceMockValue];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.delete("12345").catch((result) => {
      expect(result).toEqual({
        "Device not deleted": {
          "Persistence error": { "Write file error": "Internal write error" },
        },
      });
    });
  });

  test("Compensation should fail if write to file fails", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "error";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
      "error",
    ] as DeviceTaskError[];
    const readFileMockImplemenmtationCalls = ["device", "device"] as DeviceTaskError[];
    const readFileMockReturnValues = [deviceMockValue, deviceMockValue, deviceMockValue, {}];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.delete("12345").catch((result) => {
      expect(result).toEqual({
        "Device not deleted": {
          error: "Deletion from storage failed",
          compensation: {
            "Compensation failed": {
              "Device not added": {
                "Write file error": "Internal write error",
              },
            },
          },
        },
      });
    });
    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation failed": {
        "Device not added": {
          "Write file error": "Internal write error",
        },
      },
    });
  });

  test("Compensation should fail if read from file fails", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "error";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplemenmtationCalls = ["device", "device", "error"] as DeviceTaskError[];
    const readFileMockReturnValues = [deviceMockValue, deviceMockValue];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.delete("12345").catch((result) => {
      expect(result).toEqual({
        "Device not deleted": {
          error: "Deletion from storage failed",
          compensation: {
            "Compensation failed": {
              "Device not added": { "Read file error": "Internal read error" },
            },
          },
        },
      });
    });
    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation failed": {
        "Device not added": {
          "Read file error": "Internal read error",
        },
      },
    });
  });
});
