import { Connection } from "mongoose";
import { Device } from "../../../domain/Device";
import fs from "fs/promises";
import { FileRepositoryHelpers } from "../../../infrastructure/file/auxilaryFunctions";

export function produceGetDeviceFromDB(connection: Connection) {
  return async (deviceId: string): Promise<Device[]> => {
    const database = connection.useDb("raspberrypi_test");
    const collection = database.collection("devices");
    const response = (await collection
      .find({ id: deviceId })
      .toArray()) as unknown as Device[];
    return response;
  };
}

export function produceGetDeviceFromFiles(path: string) {
  return async (deviceId: string): Promise<Device[]> => {
    const fileRepositoryMethods = new FileRepositoryHelpers();
    return fs
      .readFile(path, "utf-8")
      .then((fileContent) => {
        const jsonObject = JSON.parse(fileContent);
        const device = fileRepositoryMethods.findByIdInFile(
          jsonObject,
          deviceId
        ) as Device;
        return device ? Promise.resolve([device]) : Promise.resolve([]);
      })
      .catch((error) => Promise.reject(error));
  };
}
