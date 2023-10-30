import request from "supertest";
import { describe, afterAll, beforeAll } from "@jest/globals";
import sanitizedConfig from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/dbCleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { addSwitch } from "./auxilaryFunctionsForTests/addSwitch";
import { Connection } from "mongoose";
import { cleanupFiles } from "./auxilaryFunctionsForTests/fileCleanup";
import PropertiesReader from "properties-reader";
import { readPropertyFile } from "../../propertyWriter";

sanitizedConfig.NODE_ENV='test_api_file'
const environment = sanitizedConfig.NODE_ENV
  const propertiesPath = readPropertyFile(environment);
  const properties = PropertiesReader(propertiesPath, undefined, {
    writer: { saveSections: true },
  });
const requestUri = `http://localhost:${properties.get('PORT')}`
describe("API RUN SWITCH TEST", () => {
  let app: Application;
  let token: string;
  let switchId: string;
  let switchWithNonExistingScriptId: string;
  let listeningSwitch: string;
  let switchWithNoPrint: string;
  beforeAll(async () => {

    app = await initializeDependencias();
    if (environment === "test_api_database"){
      const connection = (app.databaseInstance?.connection) as Connection
      await cleanupDatabase(connection);

    }
    if (environment === "test_api_file"){
      await cleanupFiles(['devices.json']);

    }    app.devicesInMemory.devices.clear();
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
    listeningSwitch = await addSwitch(
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
      .post(`/switches/run/${switchId}`)
      .set("Authorization", token)
      .send({ switchOn: true })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromSwitch.text).toMatch("switch on");
  });

  test("Should run command off script:", async () => {
    const responseFromSwitch = await request(requestUri)
      .post(`/switches/run/${switchId}`)
      .set("Authorization", token)
      .send({ switchOn: false })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromSwitch.text).toMatch("switch off");
  });

  test("Switch on should return error if file not exists:", async () => {
    const responseFromSwitch = await request(requestUri)
      .post(`/switches/run/${switchWithNonExistingScriptId}`)
      .set("Authorization", token)
      .send({ switchOn: true })
      .expect(500)
      .expect("Content-Type", /application\/json/);

    expect(Object.keys(responseFromSwitch.body)[0]).toMatch(
      "Error occured during switching on"
    );
  });

  test("Switch off should return error if file not exists:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/switches/run/${switchWithNonExistingScriptId}`)
      .set("Authorization", token)
      .send({ switchOn: false })
      .expect(500)
      .expect("Content-Type", /application\/json/);

    console.log(responseFromMeter.text);
    expect(responseFromMeter.text).toMatch(
      "Error occured during switching off"
    );
  });

  test("Should resolve promise even if process not ended:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/switches/run/${listeningSwitch}`)
      .set("Authorization", token)
      .send({ switchOn: true })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromMeter.text).toMatch(
      "Proccess not ended. Not waiting more for stdout."
    );
  });

  test("Should resolve promise even if process not printed message:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/switches/run/${switchWithNoPrint}`)
      .set("Authorization", token)
      .send({ switchOn: true })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromMeter.text).toMatch(
      "Acomplished succesfuly but not data collected"
    );
  });

  afterAll(async () => {
    if (environment=== "test_api_database"){
      await app.databaseInstance?.connection.close();}
      await app.appServer.stopServer();
  });
});
