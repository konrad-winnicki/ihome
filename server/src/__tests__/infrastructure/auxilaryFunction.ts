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

export function setMongoDeviceManagerTestConditions(
  addToMemoryStatus: boolean,
  deleteFromMemoryStatus: boolean,
  addToDBStatus: boolean,
  deleteFromDBStatus: boolean,
  addToDBMongoServerError?:string
) {
  const inMemoryStorageMock = InMemoryDeviceStorage.getInstance();

  const mockAddDeviceToStorage = jest
    .fn((device: Device) => {
      console.log(device);
    })
    .mockImplementation((device: Device) => {
      if (addToMemoryStatus) {
        inMemoryStorageMock.devices.set(device.id, device);
        return;
      }
      throw new Error("Adding to storage failed");
    });

  const mockDeleteDeviceFromStorage = jest.fn().mockImplementation(() => {
    if (deleteFromMemoryStatus) {
      return Promise.resolve("Deleted from storage");
    }
    throw new Error("Deletion from storage failed");
  });

  const databaseCreateMock = jest.fn().mockImplementation(() => {
    if (addToDBStatus) {
      return Promise.resolve("Added to database");
    }
    if(addToDBMongoServerError === 'duplicationError'){
        return Promise.reject(
            new CustomMongoServerError(11000, { errmsg: "Duplicated name" })
          )
    }
    if(addToDBMongoServerError === 'MongoServerError'){
        return Promise.reject(
            new CustomMongoServerError(1, { errmsg: "MongoServerError" })
          )
    }
    return Promise.reject("Adding to database failed");
  });

  const databaseDeleteOneMock = jest.fn().mockImplementation(() => {
    if (deleteFromDBStatus) {
      return Promise.resolve("Deleted from database");
    }
    return Promise.reject("NOT deleted from database");
  });

  const deviceDokument = {
    create: databaseCreateMock,
    deleteOne: databaseDeleteOneMock,
  } as unknown as Model<Device>;

  inMemoryStorageMock.addDevice = mockAddDeviceToStorage;
  inMemoryStorageMock.deleteDevice = mockDeleteDeviceFromStorage;
  const inMemoryDeviceManager = new InMemoryDeviceManager(inMemoryStorageMock);

  const eventEmitter = new EventEmitter();

  const mongoDeviceManager = new MongoDeviceManager(
    inMemoryDeviceManager,
    deviceDokument,
    eventEmitter
  );

  return mongoDeviceManager;
}
