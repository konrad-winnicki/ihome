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

describe("cronTaskManager with file persistence CLASS TEST - delete task", () => {
  const taskId = "678910";
  let consoleSpy: SpiedFunction;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log");
  });
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("Should delete task", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write", "write", "write"] as DeviceTaskError[];
    const readFileStatus = ["task", "task"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
      },
    };

    const itemToRead = [task, task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager
      .delete(taskId)
      .then((result) =>
        expect(result).toEqual({ "Task deleted": "No errors" })
      );
  });

  test("Should not delete task if reading from file error during deletion", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write", "write", "write"] as DeviceTaskError[];
    const readFileStatus = ["task", "error"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
      },
    };

    const itemToRead = [task, task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager.delete(taskId).catch((result) =>
      expect(result).toEqual({
        "Task not deleted": {
          "Task not deleted": { "Read file error": "Internal read error" },
        },
      })
    );
  });

  test("Should not delete task if wriring to file error during deletion", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = ["write", "error", "write"] as DeviceTaskError[];
    const readFileStatus = ["task", "task"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
      },
    };

    const itemToRead = [task, task];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    await cronTaskManager.delete(taskId).catch((result) =>
      expect(result).toEqual({
        "Task not deleted": {
          "Task not deleted": { "Write file error": "Internal write error" },
        },
      })
    );
  });

  test("Should not delete task and compensate if error during deletion from cron", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "error";
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileStatus = ["task", "task", "task"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
      },
    };

    const itemToRead = [task, task, {}];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );
    /*
    await cronTaskManager
      .delete(taskId)
      .catch((result) => console.log("CATCH", JSON.stringify(result)));
*/

    await cronTaskManager
      .delete(taskId)
      .catch((result) =>
        expect(result).toEqual({
          "Task not deleted": {
            error: "Cron error during deletion.",
            compensation: {
              error: "Cron error during deletion.",
              compensation: { "Compensation succeded": { taskId: "678910" } },
            },
          },
        })
      );
  });

  test("Compensation should fail if error during writing to file", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "error";
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "error",
     
    ] as DeviceTaskError[];
    const readFileStatus = ["task", "task", "task"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
      },
    };

    const itemToRead = [task, task, {}];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );
    /*
    await cronTaskManager
      .delete(taskId)
      .catch((result) => console.log("CATCH", JSON.stringify(result)));
*/

    await cronTaskManager
      .delete(taskId)
      .catch((result) =>
        expect(result).toEqual({
          "Task not deleted": {
            error: "Cron error during deletion.",
            compensation: {
              "Compensation failed": {
                "Task not added": {
                  "Write file error": "Internal write error",
                },
              },
            },
          },
        })
      );
  });

  test("Compensation should fail if error during reading from file", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "error";
    const writeFileStatus = [
      "write",
      "write",
      "write",
      "write"
      
    ] as DeviceTaskError[];
    const readFileStatus = ["task", "task", "error"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
      },
    };

    const itemToRead = [task, task, {}];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );
    /*
    await cronTaskManager
      .delete(taskId)
      .catch((result) => console.log("CATCH", JSON.stringify(result)));
*/

    await cronTaskManager
      .delete(taskId)
      .catch((result) =>
        expect(result).toEqual({
          "Task not deleted": {
            error: "Cron error during deletion.",
            compensation: {
              "Compensation failed": {
                "Task not added": {
                  "Read file error": "Internal read error"                },
              },
            },
          },
        })
      );
  });


  test("Should not delete task if task not exists", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = [
      "write",
      
      
    ] as DeviceTaskError[];
    const readFileStatus = ["task"] as DeviceTaskError[];

    

    const itemToRead = [{}];
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(writeFileStatus, readFileStatus, itemToRead);
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );
    /*
    await cronTaskManager
      .delete(taskId)
      .catch((result) => console.log("CATCH", JSON.stringify(result)));
*/

    await cronTaskManager
      .delete(taskId)
      .catch((result) =>
        expect(result).toEqual({
          "Task not deleted": {"error": "Task not exists"},
        })
      );
  });


  test("Should not delete task if error during searching for task", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileStatus = [
      "write",
      
      
    ] as DeviceTaskError[];
    const readFileStatus = ["error"] as DeviceTaskError[];

    const task = {
      "678910": {
        id: "678910",
        deviceId: "12345",
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
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
    /*
    await cronTaskManager
      .delete(taskId)
      .catch((result) => console.log("CATCH", JSON.stringify(result)));
*/

    await cronTaskManager
      .delete(taskId)
      .catch((result) =>
        expect(result).toEqual({
          "Task not deleted": {"error": {"Read file error": "Internal read error"}},
        })
      );
  });


});
