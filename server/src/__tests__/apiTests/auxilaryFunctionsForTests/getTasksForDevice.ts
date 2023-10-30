import { Connection } from "mongoose";
import fs from "fs/promises";
import { Task } from "../../../domain/Task";

export function getTasksForDeviceFromDB(databaseConnection: Connection
  ){

    return async (deviceId: string)=>{
      const database = databaseConnection.useDb("raspberrypi_test");
      const collection = database.collection("tasks");
      const response = (await collection.find({ deviceId: deviceId }).toArray()) as unknown as Task[]
      return response;
    }

}


export function getTasksForDeviceFromFile(path: string
  ){

    return async (deviceId: string)=>{
      return fs
      .readFile(path, "utf-8")
      .then((fileContent) => {
        const contentObject = JSON.parse(fileContent)
        const tasks = Object.values(contentObject) as unknown as Task[];
        const filteredTasks = tasks.filter((task) => {
          if (task.deviceId === deviceId) {
            return task;
          }
        });
          return Promise.resolve(filteredTasks);
      })
    }

}