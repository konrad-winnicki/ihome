import { Connection } from "mongoose";
import fs from "fs/promises";
import { Device } from "../../../domain/Device";

export function produceGetAllDevicesFromDB(connection: Connection) {
  return async ():Promise<Device[]> => {
    const database = connection.useDb("raspberrypi_test");
    const collection = database.collection("devices");
    const response = (await collection
      .find({})
      .toArray()) as unknown as Device[];
    return response;
  };
}

export function produceGetAllDevicesFromFiles(path: string) {
  return async (): Promise<Device[]> =>
    fs
      .readFile(path, "utf-8")
      .then((fileContent) => {
        const jsonObject = JSON.parse(fileContent);
        const devices = Object.values(jsonObject) as Device[];
        return Promise.resolve(devices);
      })
      .catch((error) => Promise.reject(error));
}


