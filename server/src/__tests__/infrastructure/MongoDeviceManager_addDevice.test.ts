import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";
import {
  deviceDocumentWithMockMetods,
  inMemoryStoreWithMockMethods,
  prepareMongoDeviceManagerWithMockPerameters,
} from "./auxilaryFunction";

describe("MongoDeviceManager CLASS TEST", () => {
  let consoleSpy: SpiedFunction;
  const deviceToAdd = {
    id: "12345",
    deviceType: "switch",
    name: "switch1",
    commandOn: "switch on",
  }

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });



  test("Should add device to memory and database", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";

    const inMemoryStorageMock = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceManager = prepareMongoDeviceManagerWithMockPerameters(
      inMemoryStorageMock,
      deviceDokumentMock
    );


    await mongoDeviceManager.addDevice(deviceToAdd).then((result)=> 
      expect(result).toMatch(
        "12345")
        )
     

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Should not add device if adding to database failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "error";
    const deleteFromDBStatus = "success";

    const inMemoryStorageMock = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceManager = prepareMongoDeviceManagerWithMockPerameters(
      inMemoryStorageMock,
      deviceDokumentMock
    );


    await mongoDeviceManager.addDevice(deviceToAdd).catch((err)=> expect(err).toMatch(
        "Device not added due to error: Adding to database failed"
      ))
     

    expect(consoleSpy).toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Should not add device if adding to memory failed", async () => {
    const addToMemoryStatus = "error";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";

    const inMemoryStorageMock = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceManager = prepareMongoDeviceManagerWithMockPerameters(
      inMemoryStorageMock,
      deviceDokumentMock
    );

    await mongoDeviceManager.addDevice(deviceToAdd).catch((err)=>expect(err).toMatch(
      "Device not added due to error: MemoryError: Device not added due to error: Error: Adding to storage failed"
      ))
    

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Compensation should fail if device not deleted from memory", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "error";
    const addToDBStatus = "error";
    const deleteFromDBStatus = "success";

    const inMemoryStorageMock = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceManager = prepareMongoDeviceManagerWithMockPerameters(
      inMemoryStorageMock,
      deviceDokumentMock
    );


    await mongoDeviceManager.addDevice(deviceToAdd).catch((err)=>expect(err).toMatch(
      "Device not added due to error: Compensation failed. Device not deleted from memory due err: Error: Deletion from storage failed"
      ))

    expect(consoleSpy).toHaveBeenCalledWith(
      "Adding device compensation failed."
    );
  });

  test("Shoud not add device if name already exists", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "DuplicationError";
    const deleteFromDBStatus = "success";

    const inMemoryStorageMock = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceManager = prepareMongoDeviceManagerWithMockPerameters(
      inMemoryStorageMock,
      deviceDokumentMock
    );


    await mongoDeviceManager.addDevice(deviceToAdd).catch((err)=>expect(err).toMatch(
      "MongoServerError: Unique violation error: NameConflictError"
      ))
    

    expect(consoleSpy).toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Shoud not add device if MongoServerError:", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "MongoServerError";
    const deleteFromDBStatus = "success";

    const inMemoryStorageMock = inMemoryStoreWithMockMethods(
      addToMemoryStatus,
      deleteFromMemoryStatus
    );

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceManager = prepareMongoDeviceManagerWithMockPerameters(
      inMemoryStorageMock,
      deviceDokumentMock
    );

    await mongoDeviceManager.addDevice(deviceToAdd).catch((err)=>expect(err).toMatch(
      "Device not added due error: MongoServerError: MongoServerError"
      ))


    expect(consoleSpy).toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });
});
