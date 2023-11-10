import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";
import {
  MemeoryStatusType,
  inMemoryStoreWithMockMethods,
  prepareCacheDeviceRepositoryWithMockPerameters,
} from "./mockForCacheDeviceRepository";
import { prepareFileDeviceRepositoryWithMockPerameters } from "./mockForFileDevicePersistence";
import { FileRepositoryHelpers } from "../../Infrastructure/filePersistencia/auxilaryFunctions";
import {
  DeviceTaskError,
  EmptyObject,
  ReadFileMockReturnValues,
  fsModuleMockForDevices,
} from "./mockForFileRepositoryHeplers";

describe("CacheDeviceReposiotory with file persistence CLASS TEST - add device", () => {
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

  const deviceToAdd = {
    id: "12345",
    deviceType: "switch",
    name: "switch1",
    commandOn: "switch on",
  };

  const deviceMockValue = {
    "12345": {
      id: "12345",
      deviceType: "switch",
      name: "switch2",
      commandOn: "switch on",
      commandOff: "switch off",
    },
  };

  test("Should add device", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = [
      "device",
      "device",
    ] as DeviceTaskError[];
    const readFileMockReturnValues = [{}];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository
      .add(deviceToAdd)
      .then((result) => expect(result).toEqual({ deviceId: "12345" }));
  });

  test("Should not add device if writing to file failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "error",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["device"] as DeviceTaskError[];
    const readFileMockReturnValues = [{}];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.add(deviceToAdd).catch((result) =>
      expect(result).toEqual({
        "Device not added": { "Write file error": "Internal write error" },
      })
    );
  });

  test("Should not add device if reading from file failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["error"] as DeviceTaskError[];
    const readFileMockReturnValues = [{}];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.add(deviceToAdd).catch((result) =>
      expect(result).toEqual({
        "Device not added": { "Read file error": "Internal read error" },
      })
    );
  });

  test("Should not add device if writing to file failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = ["error"] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["device"] as DeviceTaskError[];
    const readFileMockReturnValues = [{}];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.add(deviceToAdd).catch((result) =>
      expect(result).toEqual({
        "Device not added": { "Write file error": "Internal write error" },
      })
    );
  });

  test("Should not add device if id conflict", async () => {
    const deviceWithExistingId = {
      id: "12345",
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
    };
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["device"] as DeviceTaskError[];
    const readFileMockReturnValues = [deviceMockValue];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );
    await cacheDeviceRepository.add(deviceWithExistingId).catch((result) =>
      expect(result).toEqual({
        "Device not added": "Unique violation error: IdConflictError",
      })
    );
  });

  test("Should not add device if name exists", async () => {
    const deviceWithExistingName = {
      id: "54321",
      deviceType: "switch",
      name: "switch2",
      commandOn: "switch on",
    };
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["device"] as DeviceTaskError[];
    const readFileMockReturnValues = [deviceMockValue];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.add(deviceWithExistingName).catch((result) =>
      expect(result).toEqual({
        "Device not added": {
          error: "Unique violation error: NameConflictError",
        },
      })
    );
  });

  test("Should not add device and compensate if not added to cache", async () => {
    const addToMemoryStatus = "error";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = [
      "device",
      "device",
    ] as DeviceTaskError[];
    const readFileMockReturnValues = [{}, deviceMockValue];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.add(deviceToAdd).catch((result) =>
      expect(result).toStrictEqual({
        Error: "Adding to storage failed",
        compensation: {
          "Compensation succeded": { "Device deleted": "No errors" },
        },
      })
    );
  });

  test("Compensation should fail if reading from file fails", async () => {
    const addToMemoryStatus = "error";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = [
      "device",
      "error",
    ] as DeviceTaskError[];
    const readFileMockReturnValues = [{}, deviceMockValue];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.add(deviceToAdd).catch((result) =>
      expect(result).toStrictEqual({
        Error: "Adding to storage failed",
        compensation: {
          "Compensation failed": {
            "Device not added": { "Read file error": "Internal read error" },
          },
        },
      })
    );
  });

  test("Compensation should fail if writing file fails", async () => {
    const addToMemoryStatus = "error";
    const deleteFromMemoryStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "error",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = [
      "device",
      "device",
    ] as DeviceTaskError[];
    const readFileMockReturnValues = [{}, deviceMockValue];

    const cacheDeviceRepository = dependency(
      addToMemoryStatus,
      deleteFromMemoryStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cacheDeviceRepository.add(deviceToAdd).catch((result) =>
      expect(result).toStrictEqual({
        Error: "Adding to storage failed",
        compensation: {
          "Compensation failed": {
            "Device not added": { "Write file error": "Internal write error" },
          },
        },
      })
    );
  });
});
