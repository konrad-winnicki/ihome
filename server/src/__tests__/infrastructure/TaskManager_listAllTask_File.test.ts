import { describe } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
import { expect, jest, test } from "@jest/globals";


import { appCronMockMethods, prepareCronTaskManagerForFilePersistenceWithMockParameters } from "./mockForCronManager";
import { FileRepositoryHelpers } from "../../Infrastructure/filePersistencia/auxilaryFunctions";
import { DeviceTaskError, EmptyObject, ReadFileMockReturnValues, fsModuleMockForDevices } from "./mockForFileRepositoryHeplers";
import { MemeoryStatusType } from "./mockForCacheDeviceRepository";

describe("cronTaskManager CLASS TEST - list all tasks", () => {
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
      scheduledTime: {hour:"10", minutes: "10" },
    },
  };

  const deviceMockValue = {
    "12345": {
      id: "12345",
      deviceType: "switch",
      name: "switch2",
      commandOn: "switch on",
      commandOff: "switch off",
    },
  }
  
  
  
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
    const writeFileMockImplementationCalls = ["write", "write"] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task", "device"] as DeviceTaskError[];

    
    const readFileMockReturnValues = [taskMockValue, deviceMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );


    await cronTaskManager
      .listAll()
      .then((result) =>
        expect(result).toStrictEqual([{
          id: '678910',
          deviceId: '12345',
          onStatus: false,
          scheduledTime: { hour: '10', minutes: '10' }}
        ])
      );
  });

  test("Should not list task if aggregated task array is empty", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileMockImplementationCalls = ["write", "write"] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task", "device"] as DeviceTaskError[];

    
    const readFileMockReturnValues = [{}, deviceMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager
      .listAll()
      .then((result) => expect(result).toStrictEqual([]));
  });

  test("Should return error if write to file error occured during aggregation", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileMockImplementationCalls = ["write", "error"] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task", "device"] as DeviceTaskError[];

    
    const readFileMockReturnValues = [{}, deviceMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
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
    const writeFileMockImplementationCalls = ["write", "write"] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["error", "device"] as DeviceTaskError[];

    
    const readFileMockReturnValues = [{}, deviceMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );

    await cronTaskManager.listAll().catch((result) =>
      expect(result).toStrictEqual({
        "Read file error": "Internal read error"})
    );
  });

  test("Should return error if read task from file error occured during aggregation", async () => {
    const addToCronStatus = "success";
    const deleteFromCronStatus = "success";
    const writeFileMockImplementationCalls = ["write", "write"] as DeviceTaskError[];
    const readFileMockImplementationCalls = ["task", "error"] as DeviceTaskError[];

    const readFileMockReturnValues = [{}, deviceMockValue];
    const cronTaskManager = dependency(
      addToCronStatus,
      deleteFromCronStatus,
      writeFileMockImplementationCalls,
      readFileMockImplementationCalls,
      readFileMockReturnValues
    );


    await cronTaskManager.listAll().catch((result) =>
      expect(result).toStrictEqual({
        "Read file error": "Internal read error"})
    );
  });

  
});




