import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";

import {
  appCronMockMethods,
  prepareCronTaskManagerForFilePersistenceWithMockParameters,
} from "./mockForCronManager";
import { FileRepositoryHelpers } from "../../Infrastructure/filePersistencia/auxilaryFunctions";
import {
  DeviceTaskError,
  fsModuleMockForDevices,
} from "./mockForFileRepositoryHeplers";

describe("CronTaskManager with file persistence CLASS TEST - add task", () => {
  let consoleSpy: SpiedFunction;
  const taskToAdd = {
    id: "678910",
    deviceId: "12345",
    onStatus: true,
    scheduledTime: { hour: "10", minutes: "45" },
  };

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("Should add task to cron and database", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileStatus = [
      "task",
      "task",
      "device",
      "task",
    ] as DeviceTaskError[];

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
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    };
    const itemToRead = [{}, task, device, task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager
      .add(taskToAdd)
      .then((result) => expect(result).toEqual({ taskId: "678910" }));
  });


  test("Should not add task if task id exists", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write", "write"] as DeviceTaskError[];
    const readFileStatus = ["task"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
        additionalParameter: "additionalParameter",
      },
    };
   
    const itemToRead = [task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          "Task not added": { "error": "Unique violation error: IdConflictError" },
        },
      })
    );
  });

  test("Should not add task if writing to file failed", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write", "error"] as DeviceTaskError[];
    const readFileStatus = ["task"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
        additionalParameter: "additionalParameter",
      },
    };
   
    const itemToRead = [{}, task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          "Task not added": { "Write file error": "Internal write error" },
        },
      })
    );
  });

  test("Should not add task if reading from file failed", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write"] as DeviceTaskError[];
    const readFileStatus = ["error"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
        additionalParameter: "additionalParameter",
      },
    };
    const device = {
      "12345": {
        id: "12345",
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    };
    const itemToRead = [{}, task, device];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          "Task not added": { "Read file error": "Internal read error" },
        },
      })
    );
  });

  test("Should not add task and compensate if adding to cron failed", async () => {
    const addToCronStatus = "error";
    const deleteFromCronStatus = "success";
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileStatus = [
      "task",
      "task",
      "device",
      "task",
    ] as DeviceTaskError[];

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
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    };

    const itemToRead = [{}, task, device, task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          Error: "Internal cron error",
          compensation: {
            "Compensation succeded": { "Task deleted": "No errors" },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation succeded": { "Task deleted": "No errors" },
    });
  });

  test("Compensation fails reading file fails if during task deletion", async () => {
    const addToCronStatus = "error";
    const deleteFromCronStatus = "success";
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileStatus = [
      "task",
      "task",
      "device",
      "error",
    ] as DeviceTaskError[];

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
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    };

    const itemToRead = [{}, task, device, task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          Error: "Internal cron error",
          compensation: {
            "Compensation failed": {
              "Task not deleted": { "Read file error": "Internal read error" },
            },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation failed": {
        "Task not deleted": { "Read file error": "Internal read error" },
      },
    });
  });

  test("Compensation fails if reading file fails during task deletion", async () => {
    const addToCronStatus = "error";
    const deleteFromCronStatus = "success";
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "write",
      "write",
      "error",
    ] as DeviceTaskError[];
    const readFileStatus = [
      "task",
      "task",
      "device",
      "task",
    ] as DeviceTaskError[];

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
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    };

    const itemToRead = [{}, task, device, task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          Error: "Internal cron error",
          compensation: {
            "Compensation failed": {
              "Task not deleted": {
                "Write file error": "Internal write error",
              },
            },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation failed": {
        "Task not deleted": { "Write file error": "Internal write error" },
      },
    });
  });

  test("Should not add task if reading file fails during aggrregation ", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileStatus = [
      "task",
      "task",
      "error",
      "task",
    ] as DeviceTaskError[];

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
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    };

    const itemToRead = [{}, task, device, task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          Error: {
            "Persistence error": { "Read file error": "Internal read error" },
          },
          compensation: {
            "Compensation succeded": { "Task deleted": "No errors" },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation succeded": { "Task deleted": "No errors" },
    });
  });

  test("Should not add task if writing file fails during aggrregation", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = [
      "write",
      "write",
      "error",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileStatus = ["task", "task"] as DeviceTaskError[];

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
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    };

    const itemToRead = [{}, task, device, task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          Error: {
            "Persistence error": { "Write file error": "Internal write error" },
          },
          compensation: {
            "Compensation succeded": { "Task deleted": "No errors" },
          },
        },
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith({
      "Compensation succeded": { "Task deleted": "No errors" },
    });
  });
});
