import { describe } from "@jest/globals";
import { MongoDeviceManager } from "../../Infrastructure/device/MongoDeviceManager";
import { Device } from "../../domain/Device";
import { Model, mongo } from "mongoose";
import { EventEmitter } from "node:events";
import { InMemoryDeviceManager } from "../../Infrastructure/device/InMemoryDeviceManager";
import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";

describe("MongoDeviceManager CLASS TEST", () => {
  const inMemoryStorageMock = InMemoryDeviceStorage.getInstance();

  const mockAddDeviceToStorage = jest.fn((device: Device) => {});

  const mockDeleteDeviceFromStorage = jest.fn();

  const databaseCreateMock = jest.fn();

  const databaseDeleteOneMock = jest.fn();

  const deviceDokument = {
    create: databaseCreateMock,
    deleteOne: databaseDeleteOneMock,
  } as unknown as Model<Device>;

  let consoleSpy: SpiedFunction;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
    inMemoryStorageMock.devices.set("12345", {
      id: "12345",
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
    });
  });
  afterEach(() => {
    consoleSpy.mockRestore();
    inMemoryStorageMock.devices.delete("12345");
  });

  test("Should delete device", async () => {
    mockDeleteDeviceFromStorage.mockImplementation(() => {
      Promise.resolve("Deleted from storage");
    });
    inMemoryStorageMock.addDevice = mockAddDeviceToStorage;
    inMemoryStorageMock.deleteDevice = mockDeleteDeviceFromStorage;
    const inMemoryDeviceManager = new InMemoryDeviceManager(
      inMemoryStorageMock
    );

    databaseDeleteOneMock.mockImplementation(() =>
      Promise.resolve("Deleted from database")
    );

    const eventEmitter = new EventEmitter();

    const mongoDeviceManager = new MongoDeviceManager(
      inMemoryDeviceManager,
      deviceDokument,
      eventEmitter
    );

    try {
      const result = await mongoDeviceManager.deleteDevice("12345");

      expect(result).toMatch("Device deleted succesfully.");
    } catch (err) {
      console.log(err);
    }

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Delete device compensation succeeded"
    );
  });

  test("Should not delete device if deletion from database failed", async () => {
    mockDeleteDeviceFromStorage.mockImplementation(() => {
      Promise.resolve("Deleted from storage");
    });
    inMemoryStorageMock.addDevice = mockAddDeviceToStorage;
    inMemoryStorageMock.deleteDevice = mockDeleteDeviceFromStorage;
    const inMemoryDeviceManager = new InMemoryDeviceManager(
      inMemoryStorageMock
    );

    databaseDeleteOneMock.mockImplementation(() =>
      Promise.reject("NOT deleted from database")
    );

    const eventEmitter = new EventEmitter();

    const mongoDeviceManager = new MongoDeviceManager(
      inMemoryDeviceManager,
      deviceDokument,
      eventEmitter
    );

    try {
      const result = await mongoDeviceManager.deleteDevice("12345");
    } catch (err) {
      console.log(err);
      expect(err).toMatch(
        "Deletion failed due error: Deletion failed due error: Delete device compensation succeeded. Deleted Device 12345 added restored"
      );
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Delete device compensation succeeded"
    );
  });

  test("Should not delete device if deletion from memory failed", async () => {
    mockDeleteDeviceFromStorage.mockImplementation(() => {
      throw new Error("deletion from storage failed");
    });

    inMemoryStorageMock.addDevice = mockAddDeviceToStorage;
    inMemoryStorageMock.deleteDevice = mockDeleteDeviceFromStorage;
    const inMemoryDeviceManager = new InMemoryDeviceManager(
      inMemoryStorageMock
    );

    databaseCreateMock.mockImplementation(() =>
      Promise.resolve("Added to database")
    );
    databaseDeleteOneMock.mockImplementation(() =>
      Promise.resolve("Deleted from database")
    );

    const eventEmitter = new EventEmitter();

    const mongoDeviceManager = new MongoDeviceManager(
      inMemoryDeviceManager,
      deviceDokument,
      eventEmitter
    );

    try {
      const result = await mongoDeviceManager.deleteDevice("12345");
    } catch (err) {
      expect(err).toMatch(
        "Deletion failed due error: Error: deletion from storage failed"
      );
    }

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Compensation failed if addition to memory not succeded", async () => {
    mockAddDeviceToStorage.mockImplementation((device: Device) => {
      throw new Error("Adding to storage failed");
    });

    mockDeleteDeviceFromStorage.mockImplementation(() => {
      Promise.resolve("Deleted from storage");
    });
    inMemoryStorageMock.addDevice = mockAddDeviceToStorage;
    inMemoryStorageMock.deleteDevice = mockDeleteDeviceFromStorage;

    const inMemoryDeviceManager = new InMemoryDeviceManager(
      inMemoryStorageMock
    );

    databaseCreateMock.mockImplementation(() =>
      Promise.reject("Adding to database failed")
    );

    databaseDeleteOneMock.mockImplementation(() =>
      Promise.reject("NOT deleted from database")
    );

    const eventEmitter = new EventEmitter();

    const mongoDeviceManager = new MongoDeviceManager(
      inMemoryDeviceManager,
      deviceDokument,
      eventEmitter
    );
    try {
      const result = await mongoDeviceManager.deleteDevice("12345");
    } catch (err) {
      expect(err).toMatch(
        "Deletion failed due error: Delete compensation failed: Device not restored in cache due err: MemoryError: Device not added due to error: Error: Adding to storage failed"
      );
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Delete device compensation failed."
    );
  });

  test("Should not delete if deletion from memory failed", async () => {
    mockDeleteDeviceFromStorage.mockImplementation(() => {
      throw new Error("Deletion from storage failed");
    });
    inMemoryStorageMock.addDevice = mockAddDeviceToStorage;
    inMemoryStorageMock.deleteDevice = mockDeleteDeviceFromStorage;

    const inMemoryDeviceManager = new InMemoryDeviceManager(
      inMemoryStorageMock
    );

    databaseCreateMock.mockImplementation(() =>
      Promise.reject("Adding to database failed")
    );

    databaseDeleteOneMock.mockImplementation(() =>
      Promise.reject("NOT deleted from database")
    );

    const eventEmitter = new EventEmitter();

    const mongoDeviceManager = new MongoDeviceManager(
      inMemoryDeviceManager,
      deviceDokument,
      eventEmitter
    );
    try {
      const result = await mongoDeviceManager.deleteDevice("12345");
    } catch (err) {
      expect(err).toMatch(
        "Deletion failed due error: Error: Deletion from storage failed"
      );
    }

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Delete device compensation succeeded."
    );
  });
});
