import request from "supertest";
import { describe, afterAll, beforeAll } from "@jest/globals";
import { initializeApplication } from "../../initializeApplication";
import { Application } from "../../dependencies/Application";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/dbCleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { addSensor } from "./auxilaryFunctionsForTests/addSensor";
import { cleanupFiles } from "./auxilaryFunctionsForTests/fileCleanup";
import { Connection } from "mongoose";
//import appConfiguration from "../../../config/sanitizedProperties";
import cron from "node-cron";
import { getNodeEnvType } from "../../../config/config";

const environment = getNodeEnvType();

describe("API RUN METER TEST", () => {
  let app: Application;
  let token: string;
  let sensorId: string;
  let sensorWithNonExistingScriptId: string;
  let requestUri: string;
  beforeAll(async () => {
    app = await initializeApplication();
    requestUri = `http://localhost:${appConfiguration.PORT}`;
    token = await loginUser(requestUri, "testPassword");
    if (environment === "test_api_database") {
      const connection = app.databaseInstance?.connection as Connection;
      await cleanupDatabase(connection);
    } else if (environment === "test_api_file") {
      await cleanupFiles(["devices.json"]);
    }

    app.devicesInMemory.devices.clear();

    sensorId = await addSensor(
      requestUri,
      token,
      "sensor",
      "sensor1",
      { temperature: "oC", humidity: "%" },
      ". ./src/__tests__/apiTests/shellScripts/runSensor.sh"
    );
    sensorWithNonExistingScriptId = await addSensor(
      requestUri,
      token,
      "sensor",
      "sensor2",
      { temperature: "oC", humidity: "%" },
      ". ./src/__tests__/apiTests/shellScripts/notExisting.sh"
    );
  });

  afterAll(() => {});

  test("Should run command on script:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/devices/run/${sensorId}`)
      .set("Authorization", token)
      .send({
        onStatus: true,
      })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromMeter.text).toMatch(
      '{"temperature": "21", "humidity": "55"}'
    );
  });

  test("Should return error if file not exists:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/devices/run/${sensorWithNonExistingScriptId}`)
      .set("Authorization", token)
      .send({
        onStatus: true,
      })
      .expect(500)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromMeter.text).toMatch("Acomplished with error:");
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
