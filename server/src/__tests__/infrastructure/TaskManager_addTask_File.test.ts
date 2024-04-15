import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";

import {
  appCronMockMethods,
  prepareCronTaskManagerForFilePersistenceWithMockParameters,
} from "./mockForCronManager";
import { FileRepositoryHelpers } from "../../infrastructure/file/auxilaryFunctions";
import {
  DeviceTaskError,
  EmptyObject,
  ReadFileMockReturnValues,
  fsModuleMockForDevices,
} from "./mockForFileRepositoryHeplers";
import { MemeoryStatusType } from "./mockForCacheDeviceRepository";

describe("CronTaskManager with file persistence CLASS TEST - add task", () => {
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

  let consoleSpy: SpiedFunction;
  const taskToAdd = {
    id: "678910",
    deviceId: "12345",
    onStatus: true,
    scheduledTime: { hour: "10", minutes: "45" },
  };

  const taskMockValue = {
    "678910": {
      id: "678910",
      deviceId: "12345",
      onStatus: false,
      scheduledTime: { hour: "10", minutes: "10" },
    },
  };
  const deviceMockValue = {
    "12345": {
      id: "12345",
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
      commandOff: "switch off",
    },
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
    const writeFileMockImplementationCalls = [
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task"] as DeviceTaskError[];

    const readFileMockReturnValues = [{}, taskMockValue];

    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager
      .add(taskToAdd)
      .then((result) => expect(result).toEqual({ taskId: "678910" }));
  });

  test("Should not add task if task id exists", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task"] as DeviceTaskError[];

    const readFileMockReturnValues = [taskMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager.add(taskToAdd).catch((err) =>
      expect(err).toEqual({
        "Task not added": {
          "Task not added": {
            error: "Unique violation error: IdConflictError",
          },
        },
      })
    );
  });

  test("Should not add task if writing to file failed", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "error",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task"] as DeviceTaskError[];

    const readFileMockReturnValues = [{}, taskMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
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
    const writeFileMockImplementationCalls = ["write"] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["error"] as DeviceTaskError[];

    const readFileMockReturnValues = [{}, taskMockValue, deviceMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
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
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = [
      "task",
      "task",
    ] as DeviceTaskError[];

    const readFileMockReturnValues = [{}, taskMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
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

  test("Compensation fails if reading file fails during task deletion", async () => {
    const addToCronStatus = "error";
    const deleteFromCronStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = [
      "task",
      "error",
    ] as DeviceTaskError[];

    const readFileMockReturnValues = [{}, taskMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
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

  test("Compensation fails if writing file fails during task deletion", async () => {
    const addToCronStatus = "error";
    const deleteFromCronStatus = "success";
    const writeFileMockImplementationCalls = [
      "write",
      "write",
      "write",
      "error",
    ] as DeviceTaskError[];
    const readFileMockImplementationCalls = [
      "task",
      "task",
    ] as DeviceTaskError[];

    const readFileMockReturnValues = [{}, taskMockValue];

    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
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
});
