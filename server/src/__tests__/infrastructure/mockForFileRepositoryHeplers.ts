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
    .mockImplementationOnce(() => {
      switch (writeFile[0]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    })

    .mockImplementationOnce(() => {
      switch (writeFile[1]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    })
    .mockImplementationOnce(() => {
      switch (writeFile[2]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    })
    .mockImplementationOnce(() => {
      switch (writeFile[3]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    })
    .mockImplementationOnce(() => {
      switch (writeFile[4]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    })
    .mockImplementationOnce(() => {
      switch (writeFile[5]) {
        case "write":
          return Promise.resolve();
        case "error":
          return Promise.reject("Internal write error");
      }
    });

  const mockReadFile = jest
    .fn()
    .mockImplementationOnce(() => {
      switch (readFile[0]) {
        case "device":
          return Promise.resolve(JSON.stringify(itemToRead[0]));
        case "task":
          return Promise.resolve(JSON.stringify(itemToRead[0]));
        case "error":
          return Promise.reject("Internal read error");
      }
    })
    .mockImplementationOnce(() => {
      switch (readFile[1]) {
        case "device":
          return Promise.resolve(JSON.stringify(itemToRead[1]));
        case "task":
          return Promise.resolve(JSON.stringify(itemToRead[1]));
        case "error":
          return Promise.reject("Internal read error");
      }
    })
    .mockImplementationOnce(() => {
      switch (readFile[2]) {
        case "device":
          return Promise.resolve(JSON.stringify(itemToRead[2]));
        case "task":
          return Promise.resolve(JSON.stringify(itemToRead[2]));
        case "error":
          return Promise.reject("Internal read error");
      }
    })
    .mockImplementationOnce(() => {
      switch (readFile[3]) {
        case "device":
          return Promise.resolve(JSON.stringify(itemToRead[3]));
        case "task":
          return Promise.resolve(JSON.stringify(itemToRead[3]));
        case "error":
          return Promise.reject("Internal read error");
      }
    })
    .mockImplementationOnce(() => {
      switch (readFile[4]) {
        case "device":
          return Promise.resolve(JSON.stringify(itemToRead[4]));
        case "task":
          return Promise.resolve(JSON.stringify(itemToRead[4]));
        case "error":
          return Promise.reject("Internal read error");
      }
    })
    .mockImplementationOnce(() => {
      switch (readFile[5]) {
        case "device":
          return Promise.resolve(JSON.stringify(itemToRead[5]));
        case "task":
          return Promise.resolve(JSON.stringify(itemToRead[5]));
        case "error":
          return Promise.reject("Internal read error");
      }
    })
    .mockImplementationOnce(() => {
      switch (readFile[6]) {
        case "device":
          return Promise.resolve(JSON.stringify(itemToRead[6]));
        case "task":
          return Promise.resolve(JSON.stringify(itemToRead[6]));
        case "error":
          return Promise.reject("Internal read error");
      }
    });

  fs.writeFile = mockWriteFile;
  fs.readFile = mockReadFile;
}
