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

// domkniecie, clojure, HOF
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

export type callback = (param: string & Connection) => Promise<Device[]>;

export async function getAllDevices(
  callback: callback,
  callbackParam: string | Connection
) {
  return await callback(callbackParam as string & Connection);
}

export async function getAllDevicesFromDB(databaseConnection: Connection) {
  const database = databaseConnection.useDb("raspberrypi_test");
  const collection = database.collection("devices");
  const response = (await collection.find({}).toArray()) as unknown as Device[];
  return response;
}

export async function getAllDevicesFromFile(path: string): Promise<Device[]> {
  return fs
    .readFile(path, "utf-8")
    .then((fileContent) => {
      const jsonObject = JSON.parse(fileContent);
      const devices = Object.values(jsonObject) as Device[];
      return Promise.resolve(devices);
    })
    .catch((error) => Promise.reject(error));
}
