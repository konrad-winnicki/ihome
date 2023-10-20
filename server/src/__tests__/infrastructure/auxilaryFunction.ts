import { Model, mongo } from "mongoose";
import { Device } from "../../domain/Device";
import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { EventEmitter } from "koa";
import { InMemoryDeviceManager } from "../../Infrastructure/device/InMemoryDeviceManager";
import { MongoDeviceManager } from "../../Infrastructure/device/MongoDeviceManager";

class CustomMongoServerError extends mongo.MongoServerError {
  constructor(code: number, message: mongo.ErrorDescription) {
    super(message);
    this.code = code;
  }
}

export function prepareMongoDeviceManagerWithMockPerameters(
  inMemoryStorageMock: InMemoryDeviceStorage,
  deviceDocument: Model<Device>
) {
  const inMemoryDeviceManager = new InMemoryDeviceManager(inMemoryStorageMock);
  const eventEmitter = new EventEmitter();

  const mongoDeviceManager = new MongoDeviceManager(
    inMemoryDeviceManager,
    deviceDocument,
    eventEmitter
  );

  return mongoDeviceManager;
}

export function deviceDocumentWithMockMetods(
  addToDBStatus: string,
  deleteFromDBStatus: string
) {
  const databaseCreateMock = jest.fn().mockImplementation((device:Device) => {
    switch (addToDBStatus) {
      case "success":
        return Promise.resolve(device);
      case "error":
        return Promise.reject("Adding to database failed");
      case "DuplicationError":
        return Promise.reject(
          new CustomMongoServerError(11000, { errmsg: "Duplicated name" })
        );
      case "MongoServerError":
        return Promise.reject(
          new CustomMongoServerError(1, { errmsg: "MongoServerError" })
        );
    }
  });

  const databaseDeleteOneMock = jest.fn().mockImplementation(() => {
    switch (deleteFromDBStatus) {
      case "success":
        return Promise.resolve("Deleted from database");
      case "error":
        return Promise.reject("NOT deleted from database");
    }
  });

  const deviceDokumentMock = {
    create: databaseCreateMock,
    deleteOne: databaseDeleteOneMock,
  } as unknown as Model<Device>;

  return deviceDokumentMock;
}

export function inMemoryStoreWithMockMethods(
  addToMemoryStatus: string,
  deleteFromMemoryStatus: string
) {
  const inMemoryStorageMock = InMemoryDeviceStorage.getInstance();

  const mockAddDeviceToStorage = jest
    .fn()
    .mockImplementation((device: Device) => {
      switch (addToMemoryStatus) {
        case "success":
          inMemoryStorageMock.devices.set(device.id, device);
          break;
        case "error":
          throw new Error("Adding to storage failed");
      }
    });

  const mockDeleteDeviceFromStorage = jest.fn().mockImplementation(() => {
    switch (deleteFromMemoryStatus) {
      case "success":
        return Promise.resolve("Deleted from storage");
      case "error":
        throw new Error("Deletion from storage failed");
    }
  });

  inMemoryStorageMock.addDevice = mockAddDeviceToStorage;
  inMemoryStorageMock.deleteDevice = mockDeleteDeviceFromStorage;

  return inMemoryStorageMock;
}
