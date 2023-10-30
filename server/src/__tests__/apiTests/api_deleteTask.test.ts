import request from "supertest";
import { describe, afterAll, beforeEach, beforeAll } from "@jest/globals";
import sanitizedConfig from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/dbCleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { addSwitch } from "./auxilaryFunctionsForTests/addSwitch";
import cron from "node-cron";
import { addTask } from "./auxilaryFunctionsForTests/addTask";
import { cleanupFiles } from "./auxilaryFunctionsForTests/fileCleanup";
import { Connection } from "mongoose";
import PropertiesReader from "properties-reader";
import { readPropertyFile } from "../../propertyWriter";
import { Task } from "../../domain/Task";
import {
  getTasksForDeviceFromDB,
  getTasksForDeviceFromFile,
} from "./auxilaryFunctionsForTests/getTasksForDevice";

sanitizedConfig.NODE_ENV = "test_api_file";
const environment = sanitizedConfig.NODE_ENV;
const propertiesPath = readPropertyFile(environment);
const properties = PropertiesReader(propertiesPath, undefined, {
  writer: { saveSections: true },
});
const requestUri = `http://localhost:${properties.get("PORT")}`;
describe("API DELETE TASK TEST", () => {
  let app: Application;
  let token: string;
  let switch1Id: string;
  let task1Id: string;
  let task2Id: string;
  let getTasksForDevice: (deviceId: string) => Promise<Task[]>;

  beforeAll(async () => {
    app = await initializeDependencias();
    if (environment === "test_api_database") {
      const connection = app.databaseInstance?.connection as Connection;
      getTasksForDevice = getTasksForDeviceFromDB(connection);
    } else if (environment === "test_api_file") {
      getTasksForDevice = getTasksForDeviceFromFile("tasks.json");
    }
    token = await loginUser(requestUri, "testPassword");
  });

  function printCronTasks(prefix: string) {
    console.log("B-----------------", prefix, ", size:", cron.getTasks().size);
    cron.getTasks().forEach((value, key, m) => console.log(key));
    console.log("E-----------------", prefix, ", size:", cron.getTasks().size);
  }

  beforeEach(async () => {
    if (sanitizedConfig.NODE_ENV === "test_api_database") {
      const connection = app.databaseInstance?.connection as Connection;
      await cleanupDatabase(connection);
    }
    if (sanitizedConfig.NODE_ENV === "test_api_file") {
      await cleanupFiles(["devices.json", "tasks.json"]);
    }

    printCronTasks("beforeEach 1");

    app.devicesInMemory.devices.clear();
    cron.getTasks().forEach((task) => task.stop());
    cron.getTasks().clear();

    printCronTasks("beforeEach 2");

    switch1Id = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch1",
      "switch on",
      "switch off"
    );

    await addSwitch(
      requestUri,
      token,
      "switch",
      "switch2",
      "switch on",
      "switch off"
    );

    task1Id = await addTask(requestUri, token, switch1Id, true, {
      hour: "10",
      minutes: "10",
    });
    task2Id = await addTask(requestUri, token, switch1Id, true, {
      hour: "12",
      minutes: "05",
    });
  });

  test("Should delete task from database and inMemoryStorage:", async () => {
    const response = await request(requestUri)
      .delete(`/tasks/${task1Id}`)
      .set("Authorization", token)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    const taskKeysIterator = cron.getTasks().keys();
    const taskKeyList = [...taskKeysIterator];
    const deletedTaskFromMemory = cron.getTasks().get(task1Id);
    const taskFromDB = await getTasksForDevice(switch1Id);
    const [remainingTaskInDB] = taskFromDB;
    expect(Object.keys(response.body)).toEqual(["Task deleted"]);
    expect(taskKeyList).toEqual([task2Id]);
    expect(deletedTaskFromMemory).toEqual(undefined);
    expect(remainingTaskInDB.id).toEqual(task2Id);
  });
  /*
  test("Should not delete task from database if wrong task Id:", async () => {
    const nonExisitingId = "nonExisitingId";
    const response = await request(requestUri)
      .delete(`/tasks/${nonExisitingId}`)
      .set("Authorization", token)
      .expect(500)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({
      "Task not deleted": "Task with id nonExisitingId doesn't exist.",
    });
  });

  test("Should not delete task if not valid token:", async () => {
    const wrongToken = "120394985";

    const response = await request(requestUri)
      .delete(`/tasks/${task1Id}`)
      .set("Authorization", wrongToken)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({
      "Token validation error":
        "During token verification error occured: JsonWebTokenError: jwt malformed",
    });
  });

  test("Should not delete task if token not provided", async () => {
    const response = await request(requestUri)
      .delete(`/tasks/${task1Id}`)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({
      Error: "Token reqired",
    });
  });
*/

  afterAll(async () => {
    if (sanitizedConfig.NODE_ENV === "test_api_database") {
      await app.databaseInstance?.connection.close();
    }

    printCronTasks("afterAll 1");

    cron.getTasks().forEach((task) => {
      task.stop();
    });

    cron.getTasks().clear();
    printCronTasks("afterAll 2");

    await app.appServer.stopServer();
  });
});
