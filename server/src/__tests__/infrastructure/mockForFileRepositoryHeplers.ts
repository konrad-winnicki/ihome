import fs from "fs/promises";
import { Device } from "../../domain/Device";
import { Task } from "../../domain/Task";

jest.mock("fs");

export type DeviceTaskError = "device" | "task" | "write" | "error";
export type EmptyObject = {
  [key: string]: string;
};

export type ReadFileMockReturnValues = {
  [key: string]: Device | Task;
};
export function fsModuleMockForDevices(
  writeFile: DeviceTaskError[],
  readFile: DeviceTaskError[],
  itemToRead: (ReadFileMockReturnValues | EmptyObject)[]
) {
  const mockWriteFile = jest
    .fn()
    .mockImplementationOnce(async() => {
      switch (writeFile[0]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    })

    .mockImplementationOnce(async() => {
      switch (writeFile[1]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    })
    .mockImplementationOnce(async() => {
      switch (writeFile[2]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    })
    .mockImplementationOnce(async() => {
      switch (writeFile[3]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    }).mockImplementationOnce(async() => {
      switch (writeFile[4]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    })
    
    

  const mockReadFile = jest
    .fn()
    .mockImplementationOnce(async() => {
      switch (readFile[0]) {
        case "device":
          return Promise.resolve(JSON.stringify(itemToRead[0]));
        case "task":
          return Promise.resolve(JSON.stringify(itemToRead[0]));
        case "error":
          return Promise.reject("Internal read error");
      }
    })
    .mockImplementationOnce(async() => {
      switch (readFile[1]) {
        case "device":
          return Promise.resolve(JSON.stringify(itemToRead[1]));
        case "task":
          return Promise.resolve(JSON.stringify(itemToRead[1]));
        case "error":
          return Promise.reject("Internal read error");
      }
    })
    .mockImplementationOnce(async() => {
      switch (readFile[2]) {
        case "device":
          return Promise.resolve(JSON.stringify(itemToRead[2]));
        case "task":
          return Promise.resolve(JSON.stringify(itemToRead[2]));
        case "error":
          return Promise.reject("Internal read error");
      }
    })

  fs.writeFile = mockWriteFile;
  fs.readFile = mockReadFile;
}
