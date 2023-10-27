import { Connection } from "mongoose";
import { Device } from "../../../domain/Device";
import fs from "fs/promises";
import { FileRepositoryHelpers } from "../../../Infrastructure/filePersistencia/auxilaryFunctions";

export type callbackGetDevice = (param: string & Connection, param2:string) => Promise<Device[]>;

export async function getDevice(
  callback: callbackGetDevice,
  callbackParam: string | Connection, callbackParam2: string
) {
    return await callback(callbackParam as string & Connection, callbackParam2)}

export async function getDeviceFromDB(
  databaseConnection: Connection,
  deviceId: string
) {
  const database = databaseConnection.useDb("raspberrypi_test");
  const collection = database.collection("devices");
  const response = (await collection.find({ id: deviceId }).toArray()) as unknown as Device[]
  return response;
}


export async function getDeviceFromFile(path: string, deviceId: string): Promise<Device[]> {

    const fileRepositoryMethods = new FileRepositoryHelpers()
    return fs
      .readFile(path, "utf-8")
      .then((fileContent) => {
        const jsonObject = JSON.parse(fileContent);
        const device = (fileRepositoryMethods.findById(jsonObject, deviceId)) as Device
        return device? Promise.resolve([device]): Promise.resolve([])
      })
      .catch((error) => Promise.reject(error));
  }