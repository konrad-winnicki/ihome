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
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("Should not add device if adding to database failed", async () => {
    mockAddDeviceToStorage.mockImplementation((device: Device) => {
      inMemoryStorageMock.devices.set(device.id, device);
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
      Promise.reject("Add to database error")
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
      const result = await mongoDeviceManager.addDevice({
        id: "id",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
      });
      console.log("resultttttt", result);
    } catch (err) {
      console.log(err);
      expect(err).toMatch(
        "Device not added due to error: Add to database error"
      );
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Should not add device if adding to memory failed", async () => {
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
      const result = await mongoDeviceManager.addDevice({
        id: "id",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
      });
    } catch (err) {
      expect(err).toMatch(
        "Device not added due to error: MemoryError: Device not added due to error: Error: Adding to storage failed"
      );
    }

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Compensation should fail if device not deleted from memory", async () => {
    mockAddDeviceToStorage.mockImplementation((device: Device) => {
      inMemoryStorageMock.devices.set(device.id, device);
    });

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
      Promise.resolve("Deleted from database")
    );

    const eventEmitter = new EventEmitter();

    const mongoDeviceManager = new MongoDeviceManager(
      inMemoryDeviceManager,
      deviceDokument,
      eventEmitter
    );
    try {
      const result = await mongoDeviceManager.addDevice({
        id: "id",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
      });
    } catch (err) {
      expect(err).toMatch(
        "Device not added due to error: Compensation failed. Device not deleted from memory due err: Error: Deletion from storage failed"
      );
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Adding device compensation failed."
    );
  });

  test("Shoud not add device if name already exists", async () => {
    class CustomMongoServerError extends mongo.MongoServerError {
      constructor(code: number, message: mongo.ErrorDescription) {
        super(message);
        this.code = code;
      }
    }

    mockAddDeviceToStorage.mockImplementation((device: Device) => {
      inMemoryStorageMock.devices.set(device.id, device);
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
      Promise.reject(
        new CustomMongoServerError(11000, { errmsg: "Duplicated name" })
      )
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
      const result = await mongoDeviceManager.addDevice({
        id: "id",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
      });
    } catch (err) {
      expect(err).toMatch(
        "MongoServerError: Unique violation error: NameConflictError"
      );
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });
  
  test("Shoud not add device if MongoServerError:", async () => {
    class CustomMongoServerError extends mongo.MongoServerError {
      constructor(code: number, message: mongo.ErrorDescription) {
        super(message);
        this.code = code;
      }
    }

    mockAddDeviceToStorage.mockImplementation((device: Device) => {
      inMemoryStorageMock.devices.set(device.id, device);
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
      Promise.reject(
        new CustomMongoServerError(1, { errmsg: "MongoServerError"})
      )
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
      const result = await mongoDeviceManager.addDevice({
        id: "id",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
      });
    } catch (err) {
      expect(err).toMatch("Device not added due error: MongoServerError: MongoServerError");
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  
});
