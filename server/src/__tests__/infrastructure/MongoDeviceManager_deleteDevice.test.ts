import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";
import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import {
  deviceDocumentWithMockMetods,
  inMemoryStoreWithMockMethods,
  prepareMongoDeviceManagerWithMockPerameters,
} from "./mockForMongoDeviceManager";

describe("MongoDeviceManager CLASS TEST - delete device", () => {
  const inMemoryStorageMock = InMemoryDeviceStorage.getInstance();
  const deviceId = "12345";

  let consoleSpy: SpiedFunction;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
    inMemoryStorageMock.devices.set(deviceId, {
      id: deviceId,
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
    });
  });
  afterEach(() => {
    consoleSpy.mockRestore();
    inMemoryStorageMock.devices.delete(deviceId);
  });

  test("Should delete device", async () => {
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

    await mongoDeviceManager
      .deleteDevice(deviceId)
      .then((result) => expect(result).toMatch("Device deleted succesfully."));

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Delete device compensation succeeded"
    );
  });

  test("Should not delete device if deletion from database failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "success";
    const deleteFromDBStatus = "error";

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

    await mongoDeviceManager
      .deleteDevice(deviceId)
      .catch((err) =>
        expect(err).toMatch(
          "Deletion failed due error: Deletion failed due error: Delete device compensation succeeded. Deleted Device 12345 added restored"
        )
      );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Delete device compensation succeeded"
    );
  });

  test("Should not delete device if deletion from memory failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "error";
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

    await mongoDeviceManager
      .deleteDevice(deviceId)
      .catch((err) =>
        expect(err).toMatch(
          "Deletion failed due error: Error: Deletion from storage failed"
        )
      );

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Compensation failed if addition to memory not succeded", async () => {
    const addToMemoryStatus = "error";
    const deleteFromMemoryStatus = "success";
    const addToDBStatus = "error";
    const deleteFromDBStatus = "error";

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

    await mongoDeviceManager
      .deleteDevice(deviceId)
      .catch((err) =>
        expect(err).toMatch(
          "Deletion failed due error: Delete compensation failed: Device not restored in cache due err: MemoryError: Device not added due to error: Error: Adding to storage failed"
        )
      );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Delete device compensation failed."
    );
  });

  test("Should not delete if deletion from memory failed", async () => {
    const addToMemoryStatus = "success";
    const deleteFromMemoryStatus = "error";
    const addToDBStatus = "error";
    const deleteFromDBStatus = "error";

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

    await mongoDeviceManager
      .deleteDevice(deviceId)
      .catch((err) =>
        expect(err).toMatch(
          "Deletion failed due error: Error: Deletion from storage failed"
        )
      );

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Delete device compensation succeeded."
    );
  });
});
