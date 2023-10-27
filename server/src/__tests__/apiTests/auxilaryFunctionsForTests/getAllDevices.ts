import { Connection } from "mongoose";
import fs from "fs/promises";
import { Device } from "../../../domain/Device";


export type callback = (param: string & Connection) => Promise<Device[]>;

export async function getAllDevices(
  callback: callback,
  callbackParam: string | Connection
) {
 
    return await callback(callbackParam as string & Connection)}
  


export async function getAllDevicesFromDB(databaseConnection: Connection) {
  const con = databaseConnection as Connection
  const database = con.useDb("raspberrypi_test");
  const collection = database.collection("devices");
  const response = (await collection.find({}).toArray()) as unknown as Device[]
  console.log('res', response)
  return response;
}

export async function getAllDevicesFromFile(path: string): Promise<Device[]> {
  return fs
    .readFile(path, "utf-8")
    .then((fileContent) => {
      const jsonObject = JSON.parse(fileContent);
      const devices = (Object.values(jsonObject)) as Device[];
      return Promise.resolve(devices);
    })
    .catch((error) => Promise.reject(error));
}
