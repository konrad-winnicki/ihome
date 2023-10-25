import request from "supertest";
import { describe, afterAll, beforeEach, beforeAll } from "@jest/globals";
import sanitizedConfig from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/cleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { addSwitch } from "./auxilaryFunctionsForTests/addSwitch";
import cron from "node-cron";
import { getTasksForDevice } from "./auxilaryFunctionsForTests/getTasksForDevice";
import { addTask } from "./auxilaryFunctionsForTests/addTask";

const requestUri = `http://localhost:${sanitizedConfig.PORT}`;

describe("API DELETE TASK TEST", () => {
  let app: Application;
  let token: string;
  let switch1Id: string;
  let task1Id: string;
  let task2Id: string;
  beforeAll(async () => {
    app = await initializeDependencias();
    token = await loginUser(requestUri, "testPassword");
  });

  beforeEach(async () => {
    await cleanupDatabase(app.databaseInstance.connection);
    app.devicesInMemory.devices.clear();
    cron.getTasks().clear();

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
    const taskFromDB = await getTasksForDevice(
      app.databaseInstance.connection,
      switch1Id
    );
    const [remainingTaskInDB] = taskFromDB;
    expect(response.body).toEqual({ 'Task deleted': { acknowledged: true, deletedCount: 1 } });
    expect(taskKeyList).toEqual([task2Id]);
    expect(deletedTaskFromMemory).toEqual(undefined);
    expect(remainingTaskInDB.id).toEqual(task2Id);
  });

  test("Should not delete task from database if wrong task Id:", async () => {
    const nonExisitingId = "nonExisitingId";
    const response = await request(requestUri)
      .delete(`/tasks/${nonExisitingId}`)
      .set("Authorization", token)
      .expect(500)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({"Task not deleted": "Task with id nonExisitingId doesn't exist."
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

   afterAll(async () => {
    await app.databaseInstance.connection.close();
    await app.appServer.stopServer();
  });
});
