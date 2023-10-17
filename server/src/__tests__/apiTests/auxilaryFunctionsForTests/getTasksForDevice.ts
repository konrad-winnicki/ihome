import { Connection } from "mongoose";

export async function getTasksForDevice(
  databaseConnection: Connection,
  deviceId: string
) {
  const database = databaseConnection.useDb("raspberrypi_test");
  const collection = database.collection("tasks");
  const response = collection.find({ deviceId: deviceId }).toArray();

  return response;
}
