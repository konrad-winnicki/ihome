import { Connection } from "mongoose";
import { Switch } from "../../../domain/Switch";

export async function addSwitchToDB(
  databaseConnection: Connection,
  switchDevice: Switch
) {
  const database = databaseConnection.useDb("raspberrypi_test");
  const collection = database.collection("devices");
  const response = await collection.insertOne(switchDevice);
  return response;
}
