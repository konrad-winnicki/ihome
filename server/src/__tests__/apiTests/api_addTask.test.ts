import request from "supertest";
import { describe, afterAll, beforeEach, beforeAll } from "@jest/globals";
import { getNodeEnvType } from "../../../config/getNodeEnvType";
import { initializeApplication } from "../../initializeApplication";
import { Application } from "../../dependencies/Application";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/dbCleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { addSwitch } from "./auxilaryFunctionsForTests/addSwitch";
import { Connection } from "mongoose";
import cron from "node-cron";
import { cleanupFiles } from "./auxilaryFunctionsForTests/fileCleanup";
import { Task } from "../../domain/Task";
import {
  getTasksForDeviceFromDB,
  getTasksForDeviceFromFile,
} from "./auxilaryFunctionsForTests/getTasksForDevice";

const environment = getNodeEnvType();

describe("API ADD TASK TEST", () => {
  const badRequestResponse = {
    BadRequest: `Task request must contain following parameters:\n 
  {deviceId: string, onStatus:boolean, scheduledTime:{hour: sting, minutes:string}`,
  };
  let app: Application;
  let token: string;
  let switch1Id: string;
  let task1Id: string;
  let task2Id: string;
  let requestUri: string;
  let getTasksForDevice: (deviceId: string) => Promise<Task[]>;

  beforeAll(async () => {
    app = await initializeApplication();
    if (environment === "test_api_database") {
      const connection = app.databaseInstance?.connection as Connection;
      getTasksForDevice = getTasksForDeviceFromDB(connection);
    } else if (environment === "test_api_file") {
      getTasksForDevice = getTasksForDeviceFromFile("tasks.json");
    }
    requestUri = `http://localhost:${appConfiguration.PORT}`;
  });

  beforeEach(async () => {
    if (environment === "test_api_database") {
      const connection = app.databaseInstance?.connection as Connection;
      await cleanupDatabase(connection);
    } else if (environment === "test_api_file") {
      await cleanupFiles(["devices.json", "tasks.json"]);
    }

    app.devicesInMemory.devices.clear();

    cron.getTasks().forEach((task) => task.stop());
    cron.getTasks().clear();

    token = await loginUser(requestUri, "testPassword");
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
  });

  test("Should add task to database and inMemoryStorage:", async () => {
    const responseTask1 = await request(requestUri)
      .post(`/tasks`)
      .set("Authorization", token)
      .send({
        deviceId: switch1Id,
        onStatus: true,
        scheduledTime: { hour: "10", minutes: "10" },
      })

      .expect(201)
      .expect("Content-Type", /application\/json/);

    task1Id = await responseTask1.body.taskId;
    const responseTask2 = await request(requestUri)
      .post(`/tasks`)
      .set("Authorization", token)
      .send({
        deviceId: switch1Id,
        onStatus: false,
        scheduledTime: { hour: "05", minutes: "55" },
      })
      .expect(201)
      .expect("Content-Type", /application\/json/);

    task2Id = responseTask2.body.taskId;
    console.log("task2", task2Id);
    const taskKeysIterator = cron.getTasks().keys();
    const taskKeyList = [...taskKeysIterator];

    const taskFromDB = await getTasksForDevice(switch1Id);

    const [task1, task2] = taskFromDB;

    expect(responseTask1.body).toStrictEqual({ taskId: task1Id });
    expect(responseTask2.body).toStrictEqual({ taskId: task2Id });

    expect(taskKeyList).toStrictEqual([task1Id, task2Id]);

    expect(task1).toMatchObject({
      id: task1Id,
      deviceId: switch1Id,
      onStatus: true,
      scheduledTime: { hour: "10", minutes: "10" },
    });
    expect(task2).toMatchObject({
      id: task2Id,
      deviceId: switch1Id,
      onStatus: false,
      scheduledTime: { hour: "05", minutes: "55" },
    });
  });

  test("Should not add task if device not exists:", async () => {
    const responseTask1 = await request(requestUri)
      .post(`/tasks`)
      .set("Authorization", token)
      .send({
        deviceId: "notExistingId",
        onStatus: true,
        scheduledTime: { hour: "10", minutes: "10" },
      })
      .expect(500)
      .expect("Content-Type", /application\/json/);

    expect(responseTask1.body).toStrictEqual({
      "Persistence error": {
        NonExistsError: "Device with id notExistingId does not exist.",
      },
    });
  });

  it(`Add switch should return bad request error if body lack deviceId`, async () => {
    const response = await request(requestUri)
      .post(`/tasks`)
      .set("Authorization", token)
      .send({
        onStatus: true,
        scheduledTime: { hour: "10", minutes: "10" },
      })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual(badRequestResponse);
  });

  it(`Add switch should return bad request error if body lack onStatus`, async () => {
    const response = await request(requestUri)
      .post(`/tasks`)
      .set("Authorization", token)
      .send({
        deviceId: switch1Id,
        scheduledTime: { hour: "10", minutes: "10" },
      })
      .expect(400)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toEqual(badRequestResponse);
  });

  it(`Add switch should return bad request error if body lack scheduledTime`, async () => {
    const response = await request(requestUri)
      .post(`/tasks`)
      .set("Authorization", token)
      .send({
        deviceId: switch1Id,
        onStatus: false,
      })
      .expect(400)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toEqual(badRequestResponse);
  });

  it(`Add switch should return bad request error if body has additional parameter`, async () => {
    const response = await request(requestUri)
      .post(`/tasks`)
      .set("Authorization", token)
      .send({
        deviceId: switch1Id,
        onStatus: false,
        scheduledTime: { hour: "10", minutes: "10" },
        additionalParameter: "additionalParameter",
      })
      .expect(400)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toEqual(badRequestResponse);
  });

  test.each([
    {
      deviceId: 1,
      onStatus: false,
      scheduledTime: { hour: "10", minutes: "10" },
    },
    {
      deviceId: "deviceId",
      onStatus: 1,
      scheduledTime: { hour: "10", minutes: "10" },
    },
    {
      deviceId: "deviceId",
      onStatus: false,
      scheduledTime: 1,
    },
  ])(
    "Should return error if request values  does not meet type requirements:",
    async (bodyRequest) => {
      const response = await request(requestUri)
        .post(`/tasks`)
        .set("Authorization", token)
        .send(bodyRequest)
        .expect(400)
        .expect("Content-Type", /application\/json/);
      expect(response.body).toEqual(badRequestResponse);
    }
  );

  test("Should not add task if not valid token:", async () => {
    const wrongToken = "120394985";

    const response = await request(requestUri)
      .post(`/tasks`)
      .set("Authorization", wrongToken)
      .send({
        deviceId: switch1Id,
        onStatus: true,
        scheduledTime: { hour: "10", minutes: "10" },
      })
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({
      "Token validation error":
        "During token verification error occured: JsonWebTokenError: jwt malformed",
    });
  });

  test("Should not add task if token not provided", async () => {
    const response = await request(requestUri)
      .post(`/tasks`)
      .send({
        deviceId: switch1Id,
        onStatus: true,
        scheduledTime: { hour: "10", minutes: "10" },
      })
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({
      Error: "Token required",
    });
  });

  afterAll(async () => {
    if (environment === "test_api_database") {
      // await app.databaseInstance?.connection.dropDatabase()
      await app.databaseInstance?.connection.close();
    }
    if (environment === "test_api_file") {
      await cleanupFiles(["devices.json", "tasks.json"]);
    }
    cron.getTasks().forEach((task) => task.stop());
    cron.getTasks().clear();
    await app.appServer.stopServer();
  });
});
