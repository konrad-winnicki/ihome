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
  EmptyObject,
  ReadFileMockReturnValues,
  fsModuleMockForDevices,
} from "./mockForFileRepositoryHeplers";
import { MemeoryStatusType } from "./mockForCacheDeviceRepository";

describe("cronTaskManager with file persistence CLASS TEST - delete task", () => {
  const dependency = (
    addToCronStatus: MemeoryStatusType,
    deleteFromCronStatus: MemeoryStatusType,
    writeFileMockImplementationCalls: DeviceTaskError[],
    readFileMockImplemenmtationCalls: DeviceTaskError[],
    readFileMockReturnValues: (ReadFileMockReturnValues | EmptyObject)[]
  ) => {
    const appCron = appCronMockMethods(addToCronStatus, deleteFromCronStatus);

    fsModuleMockForDevices(
      writeFileMockImplementationCalls,
      readFileMockImplemenmtationCalls,
      readFileMockReturnValues
    );
    const helperMock = new FileRepositoryHelpers();

    const cronTaskManager =
      prepareCronTaskManagerForFilePersistenceWithMockParameters(
        appCron,
        helperMock
      );

    return cronTaskManager;
  };
  
  const taskMockValue = {
    "678910": {
      id: "678910",
      deviceId: "12345",
      onStatus: false,
      scheduledTime: { hour: "10", minutes: "10" },
    },
  };
  
  const taskToDelete = "678910";
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
    const writeFileMockImplementationCalls = ["write", "write", "write"] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task", "task"] as DeviceTaskError[];

    

    const readFileMockReturnValues = [taskMockValue, taskMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );
    await cronTaskManager
      .delete(taskToDelete)
      .then((result) =>
        expect(result).toEqual({ "Task deleted": "No errors" })
      );
  });

  test("Should not delete task if reading from file error during deletion", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileMockImplementationCalls = ["write", "write", "write"] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task", "error"] as DeviceTaskError[];

    const readFileMockReturnValues = [taskMockValue, taskMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager.delete(taskToDelete).catch((result) =>
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
    const writeFileMockImplementationCalls = ["write", "error", "write"] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task", "task"] as DeviceTaskError[];

    
    const readFileMockReturnValues = [taskMockValue, taskMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager.delete(taskToDelete).catch((result) =>
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
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task", "task", "task"] as DeviceTaskError[];


    const readFileMockReturnValues = [taskMockValue, taskMockValue, {}];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager
      .delete(taskToDelete)
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
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
      "error",
     
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task", "task", "task"] as DeviceTaskError[];

    const readFileMockReturnValues = [taskMockValue, taskMockValue, {}];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager
      .delete(taskToDelete)
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
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
      "write"
      
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task", "task", "error"] as DeviceTaskError[];

    const readFileMockReturnValues = [taskMockValue, taskMockValue, {}];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager
      .delete(taskToDelete)
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
    const writeFileMockImplementationCalls = [
      "write",
      
      
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task"] as DeviceTaskError[];

    

    const readFileMockReturnValues = [{}];
      const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager
      .delete(taskToDelete)
      .catch((result) =>
        expect(result).toEqual({
          "Task not deleted": {"error": "Task not exists"},
        })
      );
  });


  test("Should not delete task if error during searching for task", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      
      
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["error"] as DeviceTaskError[];

    


    const readFileMockReturnValues = [taskMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager
      .delete(taskToDelete)
      .catch((result) =>
        expect(result).toEqual({
          "Task not deleted": {"error": {"Read file error": "Internal read error"}},
        })
      );
  });


});
