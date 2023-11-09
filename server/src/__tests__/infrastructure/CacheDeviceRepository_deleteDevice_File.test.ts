import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";

import {
  inMemoryStoreWithMockMethods,
  prepareCacheDeviceRepositoryWithMockPerameters,
} from "./mockForCacheDeviceRepository";
import { FileRepositoryHelpers } from "../../Infrastructure/filePersistencia/auxilaryFunctions";
import { prepareFileDeviceRepositoryWithMockPerameters } from "./mockForFileDevicePersistence";
import {
  DeviceTaskError,
  fsModuleMockForDevices,
} from "./mockForFileRepositoryHeplers";

describe("CacheDeviceReposiotory with file persistence CLASS TEST - delete device", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  /*
  test("Should delete device from database and memory", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileStatus = "device";
    const readFileStatus = (["device", "device"]) as DeviceTaskError[]
    const itemToRead = [{
      "12345": {
        id: "12345",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
  }, {
    "12345": {
      id: "12345",
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
      commandOff: "switch off",
    },
}]

    fsModuleMock(writeFileStatus, readFileStatus, itemToRead);
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
      .delete("12345")
      .then((result) =>
        expect(result).toEqual({ "Device deleted": "No errors" })
      );
    
  });

  test("Should not delete device if device not exists", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileStatus = "device";
    const readFileStatus = (["device"]) as DeviceTaskError[]
    const itemToRead = [{
      "nonExistingID": {
        id: "nonExistingID",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
  }]

    fsModuleMock(writeFileStatus, readFileStatus, itemToRead);
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

    await cacheDeviceRepository.delete("12345").catch((result) =>
      expect(result).toEqual({
        "Device not deleted": {
          "Persistence error": {"NonExistsError": "Device with id 12345 does not exist."},
        },
      })
    );
    
  });


  test("Should not delete device if findById error", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const writeFileStatus = "device";
    const readFileStatus = (["error"]) as DeviceTaskError[]
    const itemToRead = [{
      "nonExistingID": {
        id: "nonExistingID",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
  }]

    fsModuleMock(writeFileStatus, readFileStatus, itemToRead);
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

    await cacheDeviceRepository.delete("12345").catch((result) =>
      expect(result).toEqual({
        "Device not deleted": {
          "Persistence error": {
            "Read file error": "Internal read error",
          },
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
    const writeFileStatus = "device";
    const readFileStatus = ["device", "device", "device"] as DeviceTaskError[];
    const itemToRead = [
      {
        "12345": {
          id: "12345",
          deviceType: "switch",
          name: "switch1",
          commandOn: "switch on",
          commandOff: "switch off",
        },
      },
      {
        "12345": {
          id: "12345",
          deviceType: "switch",
          name: "switch1",
          commandOn: "switch on",
          commandOff: "switch off",
        },
      },
      {},
    ];

    fsModuleMock(writeFileStatus, readFileStatus, itemToRead);
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

    
    await cacheDeviceRepository.delete("12345").catch((result: object) => {
      console.log(JSON.stringify(result));
      expect(result).toEqual({
        "Device not deleted": {
          error: "Deletion from storage failed",
          compensation: { "Compensation succeded": { deviceId: "12345" } },
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
    const writeFileStatus = "error";
    const readFileStatus = ["device"] as DeviceTaskError[];
    const itemToRead = [
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

    fsModuleMock(writeFileStatus, readFileStatus, itemToRead);
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

    await cacheDeviceRepository.delete("12345").catch((result: object) => {
      console.log(JSON.stringify(result));
      expect(result).toEqual({
        "Device not deleted": {
          "Persistence error": {"Write file error": "Internal write error"},
        },
      });
    });
    expect(consoleSpy).not.toHaveBeenCalledWith({
      "Compensation succeded": { deviceId: "12345" },
    });
  });
*/
  test("Compensation should fail if write to file fails", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "error";
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "error",
    ] as DeviceTaskError[];
    const readFileStatus = ["write", "write", "write"] as DeviceTaskError[];
    const itemToRead = [
      {
        "12345": {
          id: "12345",
          deviceType: "switch",
          name: "switch1",
          commandOn: "switch on",
          commandOff: "switch off",
        },
      },
      {
        "12345": {
          id: "12345",
          deviceType: "switch",
          name: "switch1",
          commandOn: "switch on",
          commandOff: "switch off",
        },
      },
      {
        "12345": {
          id: "12345",
          deviceType: "switch",
          name: "switch1",
          commandOn: "switch on",
          commandOff: "switch off",
        },
      },
      {},
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
    /*
    await cacheDeviceRepository
      .delete("12345")
      .catch((result) => console.log("RESSSS", JSON.stringify(result)));
*/
    await cacheDeviceRepository.delete("12345").catch((result: object) => {
      console.log(JSON.stringify(result));
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
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileStatus = ["write", "write", "error"] as DeviceTaskError[];
    const itemToRead = [
      {
        "12345": {
          id: "12345",
          deviceType: "switch",
          name: "switch1",
          commandOn: "switch on",
          commandOff: "switch off",
        },
      },
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

    await cacheDeviceRepository.delete("12345").catch((result: object) => {
      console.log(JSON.stringify(result));
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
