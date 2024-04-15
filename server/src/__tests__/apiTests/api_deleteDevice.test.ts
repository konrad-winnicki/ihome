import request from "supertest";
import { describe, afterAll, beforeEach, beforeAll } from "@jest/globals";
import { initializeApplication } from "../../initializeApplication";
import { Application } from "../../dependencies/Application";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/dbCleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import {
  produceGetDeviceFromDB,
  produceGetDeviceFromFiles,
} from "./auxilaryFunctionsForTests/getDevice";
import { addSwitch } from "./auxilaryFunctionsForTests/addSwitch";
import {
  produceGetAllDevicesFromDB,
  produceGetAllDevicesFromFiles,
} from "./auxilaryFunctionsForTests/getAllDevices";
import { cleanupFiles } from "./auxilaryFunctionsForTests/fileCleanup";
import { Connection } from "mongoose";
import { Device } from "../../domain/Device";
import cron from "node-cron";
import { getNodeEnvType } from "../../../config/config";

const environment = getNodeEnvType();

describe("API DELETE DEVICE TEST", () => {
  let app: Application;
  let token: string;
  let switch1Id: string;
  let switch2Id: string;
  let requestUri: string;
  let listDevices: () => Promise<Device[]>;
  let getDevice: (deviceId: string) => Promise<Device[]>;
  beforeAll(async () => {
    app = await initializeApplication();
    if (environment === "test_api_database") {
      const connection = app.databaseInstance?.connection as Connection;
      listDevices = produceGetAllDevicesFromDB(connection);
      getDevice = produceGetDeviceFromDB(connection);
    } else if (environment === "test_api_file") {
      listDevices = produceGetAllDevicesFromFiles("devices.json");
      getDevice = produceGetDeviceFromFiles("devices.json");
    }
    requestUri = `http://localhost:${appConfiguration.PORT}`;
  });

  beforeEach(async () => {
    if (environment === "test_api_database") {
      console.log("before cleanup", app.devicesInMemory.devices);

      const connection = app.databaseInstance?.connection as Connection;
      await cleanupDatabase(connection);
      console.log("sfter cleanup", app.devicesInMemory.devices);
    }
    if (environment === "test_api_file") {
      await cleanupFiles(["devices.json", "tasks.json"]);
    }
    app.devicesInMemory.devices.clear();
    token = await loginUser(requestUri, "testPassword");

    switch1Id = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch1",
      "switch on",
      "switch off"
    );

    switch2Id = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch2",
      "switch on",
      "switch off"
    );
  });

  test("Should not delete device from database if wrong device Id:", async () => {
    const nonExisitingId = "nonExisitingId";
    const response = await request(requestUri)
      .delete(`/devices/${nonExisitingId}`)
      .set("Authorization", token)
      .expect(500)
      .expect("Content-Type", /application\/json/);

    const devicesInDB = await listDevices();
    const [device1, device2] = app.devicesInMemory.devices.values();
    expect(response.body).toEqual({
      ["Device not deleted"]: {
        "Persistence error": {
          NonExistsError: "Device with id nonExisitingId does not exist.",
        },
      },
    });
    expect(devicesInDB).toMatchObject([
      {
        id: switch1Id,
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
      {
        id: switch2Id,
        deviceType: "switch",
        name: "switch2",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    ]);

    expect([device1, device2]).toMatchObject([
      {
        id: switch1Id,
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
      {
        id: switch2Id,
        deviceType: "switch",
        name: "switch2",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    ]);
  });

  test("Should delete switch from database and inMemoryStorage:", async () => {
    const response = await request(requestUri)
      .delete(`/devices/${switch1Id}`)
      .set("Authorization", token)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    const findDeteledItem = await getDevice(switch1Id);

    const deletedDeviceFromMemory = app.devicesInMemory.devices.get(switch1Id);
    expect(response.body).toEqual({ "Device deleted": "No errors" });
    expect(findDeteledItem).toEqual([]);
    expect(deletedDeviceFromMemory).toEqual(undefined);
  });

  test("Should not delete device if not valid token:", async () => {
    const wrongToken = "120394985";

    const response = await request(requestUri)
      .delete(`/devices/${switch1Id}`)
      .set("Authorization", wrongToken)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({
      "Token validation error":
        "During token verification error occured: JsonWebTokenError: jwt malformed",
    });
  });

  test("Should not delete device if token not provided", async () => {
    const response = await request(requestUri)
      .delete(`/devices/${switch1Id}`)
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
      await cleanupFiles(["devices.json"]);
    }
    cron.getTasks().forEach((task) => task.stop());
    cron.getTasks().clear();
    await app.appServer.stopServer();
  });
});
