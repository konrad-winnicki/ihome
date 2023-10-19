import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";
import { setMongoDeviceManagerTestConditions } from "./auxilaryFunction";

describe("MongoDeviceManager CLASS TEST", () => {
  
  let consoleSpy: SpiedFunction;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("Should not add device if adding to database failed", async () => {
    const mongoDeviceManager = setMongoDeviceManagerTestConditions(
      true,
      true,
      false,
      true
    );

    try {
      const result = await mongoDeviceManager.addDevice({
        id: "id",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
      });
    } catch (err) {
      console.log(err);
      expect(err).toMatch(
        "Device not added due to error: Adding to database failed"
      );
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });

  test("Should not add device if adding to memory failed", async () => {

    const mongoDeviceManager = setMongoDeviceManagerTestConditions(false, true, true, true)
    
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
    const mongoDeviceManager = setMongoDeviceManagerTestConditions(true, false, false, true)
    
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

    const mongoDeviceManager = setMongoDeviceManagerTestConditions(true, true, false, true, "duplicationError")
    
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

    const mongoDeviceManager= setMongoDeviceManagerTestConditions(true, true, false, true, "MongoServerError")
    
    try {
      const result = await mongoDeviceManager.addDevice({
        id: "id",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
      });
    } catch (err) {
      expect(err).toMatch(
        "Device not added due error: MongoServerError: MongoServerError"
      );
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Add device compensation succeeded."
    );
  });
});
