import request from "supertest";
import { describe, afterAll, beforeAll } from "@jest/globals";
import { initializeApplication } from "../../initializeApplication";
import { Application } from "../../dependencies/Application";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/dbCleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { addSwitch } from "./auxilaryFunctionsForTests/addSwitch";
import { Connection } from "mongoose";
import { cleanupFiles } from "./auxilaryFunctionsForTests/fileCleanup";
import cron from "node-cron";
import { getNodeEnvType } from "../../../config/config";

const environment = getNodeEnvType();

describe("API RUN SWITCH TEST", () => {
  let app: Application;
  let token: string;
  let switchId: string;
  let switchWithNonExistingScriptId: string;
  let hangingSwitch: string;
  let switchWithNoPrint: string;
  let requestUri: string;
  beforeAll(async () => {
    app = await initializeApplication();
    if (environment === "test_api_database") {
      const connection = app.databaseInstance?.connection as Connection;
      await cleanupDatabase(connection);
    } else if (environment === "test_api_file") {
      await cleanupFiles(["devices.json"]);
    }
    requestUri = `http://localhost:${appConfiguration.PORT}`;

    app.devicesInMemory.devices.clear();
    token = await loginUser(requestUri, "testPassword");
    switchId = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch1",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchOn.sh",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchOff.sh"
    );

    switchWithNonExistingScriptId = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch2",
      ". ./src/__tests__/apiTests/shellScripts/nonExisiting.sh",
      ". ./src/__tests__/apiTests/shellScripts/nonExisting.sh"
    );
    hangingSwitch = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch3",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchWithDelay.sh",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchOff.sh"
    );
    switchWithNoPrint = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch4",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchWithNoPrint.sh",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchOff.sh"
    );
  });

  test("Should run command on script:", async () => {
    const responseFromSwitch = await request(requestUri)
      .post(`/devices/run/${switchId}`)
      .set("Authorization", token)
      .send({ onStatus: true })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromSwitch.text).toMatch("switch on");
  });

  test("Should run command off script:", async () => {
    await switchOn(requestUri, switchId, token);
    const responseFromSwitch = await request(requestUri)
      .post(`/devices/run/${switchId}`)
      .set("Authorization", token)
      .send({ onStatus: false })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromSwitch.text).toMatch("switch off");
  });

  test("Switch on should return error if file not exists:", async () => {
    const responseFromSwitch = await request(requestUri)
      .post(`/devices/run/${switchWithNonExistingScriptId}`)
      .set("Authorization", token)
      .send({ onStatus: true })
      .expect(500)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromSwitch.text).toMatch("Acomplished with error:");
  });

  test("Switch off should return error if file not exists:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/devices/run/${switchWithNonExistingScriptId}`)
      .set("Authorization", token)
      .send({ onStatus: true })
      .expect(500)
      .expect("Content-Type", /text\/plain/);
    expect(responseFromMeter.text).toMatch("Acomplished with error:");
  });

  test("Switch off should return error if is already off:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/devices/run/${switchId}`)
      .set("Authorization", token)
      .send({ onStatus: false })
      .expect(500)
      .expect("Content-Type", /text\/plain/);
    expect(responseFromMeter.text).toMatch("Device is currently off");
  });

  test("Switch off should return error if is already on:", async () => {
    await request(requestUri)
      .post(`/devices/run/${switchId}`)
      .set("Authorization", token)
      .send({ onStatus: true });

    const responseFromMeter = await request(requestUri)
      .post(`/devices/run/${switchId}`)
      .set("Authorization", token)
      .send({ onStatus: true })
      .expect(500)
      .expect("Content-Type", /text\/plain/);
    console.log(responseFromMeter.text);
    expect(responseFromMeter.text).toMatch("Device is currently on");
  });

  test("Should timeout waiting for switch command result", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/devices/run/${hangingSwitch}`)
      .set("Authorization", token)
      .send({ onStatus: true })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromMeter.text).toMatch(
      "Proccess not ended. Not waiting more for stdout."
    );
  });

  test("Should resolve promise even if process not printed message:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/devices/run/${switchWithNoPrint}`)
      .set("Authorization", token)
      .send({ onStatus: true })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromMeter.text).toMatch(
      "Acomplished successfuly but not data collected"
    );
  });

  afterAll(async () => {
    if (environment === "test_api_database") {
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

async function switchOn(requestUri: string, switchId: string, token: string) {
  await request(requestUri)
    .post(`/devices/run/${switchId}`)
    .set("Authorization", token)
    .send({ onStatus: true });
}
