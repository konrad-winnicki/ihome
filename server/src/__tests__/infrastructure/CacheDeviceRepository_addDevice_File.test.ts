import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";
import {
  inMemoryStoreWithMockMethods,
  prepareCacheDeviceRepositoryWithMockPerameters,
} from "./mockForCacheDeviceRepository";
import { prepareFileDeviceRepositoryWithMockPerameters } from "./mockForFileDevicePersistence";
import { FileRepositoryHelpers } from "../../Infrastructure/filePersistencia/auxilaryFunctions";
import {
  DeviceTaskError,
  fsModuleMockForDevices,
} from "./mockForFileRepositoryHeplers";

describe("CacheDeviceReposiotory with file persistence CLASS TEST - add device", () => {
  const deviceToAdd = {
    id: "12345",
    deviceType: "switch",
    name: "switch1",
    commandOn: "switch on",
  };

  test("Should add device", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileStatus = ["write", "write"] as DeviceTaskError[];
    const readFileStatus = ["device","device",] as DeviceTaskError[];
    const itemToRead = [{}];

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const fileDeviceRepository =
      prepareFileDeviceRepositoryWithMockPerameters(helperMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        fileDeviceRepository
      );

    await cacheDeviceRepository
      .add(deviceToAdd)
      .then((result) => expect(result).toEqual({ deviceId: "12345" }));
  });

  test("Should not add device if writing to file failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileStatus = ["write", "error"] as DeviceTaskError[];
    const readFileStatus = ["device",] as DeviceTaskError[];
    const itemToRead = [{}];

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const fileDeviceRepository =
      prepareFileDeviceRepositoryWithMockPerameters(helperMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        fileDeviceRepository
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
    const writeFileStatus = ["write", "write"] as DeviceTaskError[];
    const readFileStatus = ["error"] as DeviceTaskError[];
    const itemToRead = [{}];

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const fileDeviceRepository =
      prepareFileDeviceRepositoryWithMockPerameters(helperMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        fileDeviceRepository
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
    const writeFileStatus = ["error"] as DeviceTaskError[];
    const readFileStatus = ["device",] as DeviceTaskError[];
    const itemToRead = [{}];

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const fileDeviceRepository =
      prepareFileDeviceRepositoryWithMockPerameters(helperMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        fileDeviceRepository
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
    const writeFileStatus = ["write", "write"] as DeviceTaskError[];
    const readFileStatus = ["device",] as DeviceTaskError[];
    const itemToRead = [
      {
        "12345": {
          id: "12345",
          deviceType: "switch",
          name: "switch2",
          commandOn: "switch on",
          commandOff: "switch off",
        },
      },
    ];

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const fileDeviceRepository =
      prepareFileDeviceRepositoryWithMockPerameters(helperMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        fileDeviceRepository
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
    const writeFileStatus = ["write", "write"] as DeviceTaskError[];
    const readFileStatus = ["device","device",] as DeviceTaskError[];
    const itemToRead = [
      {
        "543211": {
          id: "543211",
          deviceType: "switch",
          name: "switch1",
          commandOn: "switch on",
          commandOff: "switch off",
        },
      },
    ];

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const fileDeviceRepository =
      prepareFileDeviceRepositoryWithMockPerameters(helperMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        fileDeviceRepository
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
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileStatus = ["device","device",] as DeviceTaskError[];
    const itemToRead = [
      {},
      {
        "12345": {
          id: "12345",
          deviceType: "switch",
          name: "switch1",
          commandOn: "switch on",
          commandOff: "switch off",
        },
      },
    ];

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const fileDeviceRepository =
      prepareFileDeviceRepositoryWithMockPerameters(helperMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        fileDeviceRepository
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
    const writeFileStatus = ["write", "write", "write"] as DeviceTaskError[];
    const readFileStatus = ["device","error",] as DeviceTaskError[];
    const itemToRead = [{}, {
      "12345": {
        id: "12345",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    }];

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const fileDeviceRepository =
      prepareFileDeviceRepositoryWithMockPerameters(helperMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        fileDeviceRepository
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
    const writeFileStatus = ["write", "write", "error"] as DeviceTaskError[];
    const readFileStatus = ["device","device",] as DeviceTaskError[];
    const itemToRead = [
      {},
      {
        "12345": {
          id: "12345",
          deviceType: "switch",
          name: "switch1",
          commandOn: "switch on",
          commandOff: "switch off",
        },
      },
    ];

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const fileDeviceRepository =
      prepareFileDeviceRepositoryWithMockPerameters(helperMock);
    const inMemoryStorage = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );
    const cacheDeviceRepository =
      prepareCacheDeviceRepositoryWithMockPerameters(
        inMemoryStorage,
        fileDeviceRepository
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
