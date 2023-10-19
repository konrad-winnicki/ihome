import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";
import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { setMongoDeviceManagerTestConditions } from "./auxilaryFunction";
describe("MongoDeviceManager CLASS TEST - delete device", () => {
  const inMemoryStorageMock = InMemoryDeviceStorage.getInstance();

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
    const mongoDeviceManager = setMongoDeviceManagerTestConditions(
      true,
      true,
      true,
      true
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
    const mongoDeviceManager = setMongoDeviceManagerTestConditions(
      true,
      true,
      true,
      false
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
    const mongoDeviceManager = setMongoDeviceManagerTestConditions(
      true,
      false,
      true,
      true
    );

    try {
      const result = await mongoDeviceManager.deleteDevice("12345");
    } catch (err) {
      expect(err).toMatch(
        "Deletion failed due error: Error: Deletion from storage failed"
      );
    }

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Compensation failed if addition to memory not succeded", async () => {
    const mongoDeviceManager = setMongoDeviceManagerTestConditions(
      false,
      true,
      false,
      false
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
    const mongoDeviceManager = setMongoDeviceManagerTestConditions(
      true,
      false,
      false,
      false
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
