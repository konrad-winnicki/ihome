import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";


import { AggregatedTask } from "../../domain/AggregatedTask";
import { appCronMockMethods, prepareCronTaskManagerForFilePersistenceWithMockParameters } from "./mockForCronManager";
import { FileRepositoryHelpers } from "../../Infrastructure/filePersistencia/auxilaryFunctions";
import { DeviceTaskError, fsModuleMockForDevices } from "./mockForFileRepositoryHeplers";

describe("cronTaskManager CLASS TEST - list all tasks", () => {
  let consoleSpy: SpiedFunction;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("Should list all tasks", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write", "write"] as DeviceTaskError[];
    const readFileStatus = ["task", "device"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
      },
    };

    const device = {
      "12345": {
        id: "12345",
        deviceType: "switch",
        name: "switch2",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    }
    const itemToRead = [task, device];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );


    await cronTaskManager
      .listAll()
      .then((result) =>
        expect(result).toStrictEqual([
          new AggregatedTask("678910", false, 10, 10, "switch on", "switch off"),
        ])
      );
  });

  test("Should not list task if aggregated task array is empty", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write", "write"] as DeviceTaskError[];
    const readFileStatus = ["task", "device"] as DeviceTaskError[];

    const device = {
      "12345": {
        id: "12345",
        deviceType: "switch",
        name: "switch2",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    }
    const itemToRead = [{}, device];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );


    await cronTaskManager
      .listAll()
      .then((result) => expect(result).toStrictEqual([]));
  });

  test("Should return error if write to file error occured during aggregation", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write", "error"] as DeviceTaskError[];
    const readFileStatus = ["task", "device"] as DeviceTaskError[];

    const device = {
      "12345": {
        id: "12345",
        deviceType: "switch",
        name: "switch2",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    }
    const itemToRead = [{}, device];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );


    await cronTaskManager.listAll().catch((result) =>
      expect(result).toStrictEqual({
        "Write file error": "Internal write error",
      })
    );
  });

  test("Should return error if read task from file error occured during aggregation", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write", "write"] as DeviceTaskError[];
    const readFileStatus = ["error", "device"] as DeviceTaskError[];

    const device = {
      "12345": {
        id: "12345",
        deviceType: "switch",
        name: "switch2",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    }
    const itemToRead = [{}, device];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );


    await cronTaskManager.listAll().catch((result) =>
      expect(result).toStrictEqual({
        "Read file error": "Internal read error"})
    );
  });

  test("Should return error if read task from file error occured during aggregation", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write", "write"] as DeviceTaskError[];
    const readFileStatus = ["task", "error"] as DeviceTaskError[];

    const device = {
      "12345": {
        id: "12345",
        deviceType: "switch",
        name: "switch2",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    }
    const itemToRead = [{}, device];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );


    await cronTaskManager.listAll().catch((result) =>
      expect(result).toStrictEqual({
        "Read file error": "Internal read error"})
    );
  });

  
});




