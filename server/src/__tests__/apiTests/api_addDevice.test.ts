import request from "supertest";
import { describe, afterAll, beforeEach, beforeAll } from "@jest/globals";
import { getNodeEnvType } from "../../../config/getNodeEnvType";
import { initializeApplication } from "../../initializeApplication";
import { Application } from "../../dependencies/Application";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/dbCleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import {
  produceGetAllDevicesFromDB,
  produceGetAllDevicesFromFiles,
} from "./auxilaryFunctionsForTests/getAllDevices";
import { addSwitch } from "./auxilaryFunctionsForTests/addSwitch";
import { cleanupFiles } from "./auxilaryFunctionsForTests/fileCleanup";
import { Connection } from "mongoose";
import { Device } from "../../domain/Device";
//import appConfiguration from "../../../config/sanitizedProperties";
import cron from "node-cron";

const environment = getNodeEnvType();

describe("API ADD DEVICE TEST", () => {
  const badRequestResponse = {
    BadRequest: `For meters request must contain following parameters:\n 
  {deviceType: string, name:string, parameters:{[key:string]: sting}, commandOn:string}\n
  For switches request must contain following parameters:\n 
  {deviceType: string, name:string, commandOn:string, commandOff: string}`,
  };
  let app: Application;
  let token: string;
  let listDevices: () => Promise<Device[]>;
  let requestUri: string;
  beforeAll(async () => {
    app = await initializeApplication();
    if (environment === "test_api_database") {
      const connection = app.databaseInstance?.connection as Connection;
      listDevices = produceGetAllDevicesFromDB(connection);
    } else if (environment === "test_api_file") {
      listDevices = produceGetAllDevicesFromFiles("devices.json");
    }

    requestUri = `http://localhost:${appConfiguration.PORT}`;
  });

  beforeEach(async () => {
    if (environment === "test_api_database") {
      const connection = app.databaseInstance?.connection as Connection;
      await cleanupDatabase(connection);
    } else if (environment === "test_api_file") {
      await cleanupFiles(["devices.json"]);
    }
    app.devicesInMemory.devices.clear();
    token = await loginUser(requestUri, "testPassword");
  });

  test("Should add switch to database and inMemoryStorage:", async () => {
    const response = await request(requestUri)
      .post(`/devices`)
      .set("Authorization", token)
      .send({
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      })
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const deviceId = response.body.deviceId;
    const devicesInMemory = app.devicesInMemory.devices.get(deviceId);
    const [device] = await listDevices();

    expect(response.body).toHaveProperty("deviceId");
    expect(devicesInMemory).toMatchObject({
      id: deviceId,
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
      commandOff: "switch off",
      onStatus: false,
    });

    expect(device).toMatchObject({
      id: deviceId,
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
      commandOff: "switch off",
      onStatus: false,
    });
  });

  test("Should add sensor to database and inMemoryStorage:", async () => {
    const response = await request(requestUri)
      .post(`/devices`)
      .set("Authorization", token)
      .send({
        deviceType: "sensor",
        name: "sensor1",
        parameters: { temperature: "oC", humidity: "%" },
        commandOn: "sensor on",
      })
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const deviceId = response.body.deviceId;
    const devicesInMemory = app.devicesInMemory.devices.get(deviceId);
    const [device] = await listDevices();

    expect(response.body).toHaveProperty("deviceId");
    expect(devicesInMemory).toEqual({
      id: deviceId,
      deviceType: "sensor",
      name: "sensor1",
      parameters: { temperature: "oC", humidity: "%" },
      commandOn: "sensor on",
    });

    expect(device).toMatchObject({
      id: deviceId,
      deviceType: "sensor",
      name: "sensor1",
      parameters: { temperature: "oC", humidity: "%" },
      commandOn: "sensor on",
    });
  });

  test.each([
    {
      name: "switch1",
      commandOn: "switch on",
      commandOff: "switch off",
    },
    {
      deviceType: "switch",
      commandOn: "switch on",
      commandOff: "switch off",
    },
    {
      deviceType: "switch",
      name: "switch1",
      commandOff: "switch off",
    },
    {
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
    },
    {
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
      commandOff: "switch off",
      id: "id1",
    },
    {
      deviceType: 1,
      name: "switch1",
      commandOn: "switch on",
      commandOff: "switch off",
    },
    {
      deviceType: "switch",
      name: 1,
      commandOn: "switch on",
      commandOff: "switch off",
    },
    {
      deviceType: "switch",
      name: "switch1",
      commandOn: 1,
      commandOff: "switch off",
    },
    {
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
      commandOff: 1,
    },
  ])("Should return error if bad request:", async (bodyRequest) => {
    const response = await request(requestUri)
      .post(`/devices`)
      .set("Authorization", token)
      .send(bodyRequest)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toEqual(badRequestResponse);
  });

  [
    {
      description: "body lacks deviceType",
      body: {
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    },
    {
      description: "body lacks name",
      body: {
        deviceType: "switch",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    },
    {
      description: "body lacks commandOn",
      body: {
        deviceType: "switch",
        name: "switch1",
        commandOff: "switch off",
      },
    },
    {
      description: "body lacks commandOff",
      body: {
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
      },
    },

    {
      description: "body has additional parameter",
      body: {
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
        id: "id1",
      },
    },
    {
      description: "deviceType is a number",
      body: {
        deviceType: 1,
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    },
    {
      description: "name is a number",
      body: {
        deviceType: "switch",
        name: 1,
        commandOn: "switch on",
        commandOff: "switch off",
      },
    },
    {
      description: "commandOn is a number",
      body: {
        deviceType: "switch",
        name: "switch1",
        commandOn: 1,
        commandOff: "switch off",
      },
    },
    {
      description: "commandOff is a number",
      body: {
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: 1,
      },
    },
  ].forEach(({ description, body }) => {
    it(`Add switch should return bad request error if ${description}`, async () => {
      const response = await request(requestUri)
        .post(`/devices`)
        .set("Authorization", token)
        .send(body)
        .expect(400)
        .expect("Content-Type", /application\/json/);
      expect(response.body).toEqual(badRequestResponse);
    });
  });

  [
    {
      description: "body lacks deviceType",
      body: {
        name: "sensor1",
        parameters: { temperature: "oC", humidity: "%" },
        commandOn: "sensor on",
      },
    },
    {
      description: "body lacks name",
      body: {
        deviceType: "sensor",
        parameters: { temperature: "oC", humidity: "%" },
        commandOn: "sensor on",
      },
    },
    {
      description: "body lacks parameters",
      body: {
        name: "sensor1",
        deviceType: "sensor",
        commandOn: "sensor on",
      },
    },

    {
      description: "body lacks commandOn",
      body: {
        deviceType: "sensor",
        name: "sensor1",
        parameters: { temperature: "oC", humidity: "%" },
      },
    },

    {
      description: "body has additional parameter",
      body: {
        deviceType: "sensor",
        name: "sensor1",
        parameters: { temperature: "oC", humidity: "%" },
        commandOn: "sensor on",
        id: "id1",
      },
    },
    {
      description: "deviceType is a number",
      body: {
        deviceType: 1,
        name: "sensor1",
        parameters: { temperature: "oC", humidity: "%" },
        commandOn: "sensor on",
      },
    },
    {
      description: "name is a number",
      body: {
        deviceType: "sensor",
        name: 1,
        parameters: { temperature: "oC", humidity: "%" },
        commandOn: "sensor on",
      },
    },
    {
      description: "commandOn is a number",
      body: {
        deviceType: "sensor",
        name: "sensor1",
        parameters: { temperature: "oC", humidity: "%" },
        commandOn: 1,
      },
    },
    {
      description: "parameter is not an object",
      body: {
        deviceType: "sensor",
        name: "sensor1",
        parameters: "not an object",
        commandOn: "sensor on",
      },
    },
  ].forEach(({ description, body }) => {
    it(`Add sensor should return bad request error if ${description}`, async () => {
      const response = await request(requestUri)
        .post(`/devices`)
        .set("Authorization", token)
        .send(body)
        .expect(400)
        .expect("Content-Type", /application\/json/);
      expect(response.body).toEqual(badRequestResponse);
    });
  });

  test("Should not add device if not valid token:", async () => {
    const wrongToken = "120394985";

    const response = await request(requestUri)
      .post(`/devices`)
      .set("Authorization", wrongToken)
      .send({
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      })
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({
      "Token validation error":
        "During token verification error occured: JsonWebTokenError: jwt malformed",
    });
  });

  test("Should not add device if token not provided", async () => {
    const response = await request(requestUri)
      .post(`/devices`)
      .send({
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      })
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({
      Error: "Token required",
    });
  });

  test("Should return conflict error if device name already exists:", async () => {
    const deviceId = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch1",
      "switch on",
      "switch off"
    );
    const response = await request(requestUri)
      .post(`/devices`)
      .set("Authorization", token)
      .send({
        deviceType: "switch",
        name: "switch1",
        commandOn: "switchchchchch on",
        commandOff: "switch off",
      })
      .expect(409)
      .expect("Content-Type", /application\/json/);

    console.log("RESSSS", response.body);

    expect(response.body).toEqual({
      "Device not added": {
        error: "Unique violation error: NameConflictError",
      },
    });

    const [...devicesInMemoryKeys] = app.devicesInMemory.devices.keys();
    const deviceInMemory = app.devicesInMemory.devices.get(deviceId);
    const [device] = await listDevices();
    expect(devicesInMemoryKeys).toEqual([deviceId]);

    expect(deviceInMemory).toEqual({
      id: deviceId,
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
      commandOff: "switch off",
      onStatus: false,
    });

    expect(device).toMatchObject({
      id: deviceId,
      deviceType: "switch",
      name: "switch1",
      commandOn: "switch on",
      commandOff: "switch off",
      onStatus: false,
    });
  });

  afterAll(async () => {
    if (environment === "test_api_database") {
      //await app.databaseInstance?.connection.dropDatabase()

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
