import request from "supertest";
import { describe, afterAll, beforeAll } from "@jest/globals";
import sanitizedConfig from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/dbCleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { addMeter } from "./auxilaryFunctionsForTests/addMeter";
import { cleanupFiles } from "./auxilaryFunctionsForTests/fileCleanup";
import { Connection } from "mongoose";
import PropertiesReader from "properties-reader";
import { readPropertyFile } from "../../propertyWriter";


sanitizedConfig.NODE_ENV='test_api_file'
const environment = sanitizedConfig.NODE_ENV
  const propertiesPath = readPropertyFile(environment);
  const properties = PropertiesReader(propertiesPath, undefined, {
    writer: { saveSections: true },
  });
const requestUri = `http://localhost:${properties.get('PORT')}`
describe("API RUN METER TEST", () => {
  let app: Application;
  let token: string;
  let meterId: string;
  let meterWithNonExistingScriptId: string;

  beforeAll(async () => {

    app = await initializeDependencias();
    token = await loginUser(requestUri, "testPassword");
    if (environment === "test_api_database"){
      const connection = (app.databaseInstance?.connection) as Connection
      await cleanupDatabase(connection);

    }
    if (environment === "test_api_file"){
      await cleanupFiles();

    }    app.devicesInMemory.devices.clear();

    meterId = await addMeter(
      requestUri,
      token,
      "meter",
      "meter1",
      { temperature: "oC", humidity: "%" },
      ". ./src/__tests__/apiTests/shellScripts/runMeter.sh"
    );
    meterWithNonExistingScriptId = await addMeter(
      requestUri,
      token,
      "meter",
      "meter2",
      { temperature: "oC", humidity: "%" },
      ". ./src/__tests__/apiTests/shellScripts/notExisting.sh"
    );
  });

  afterAll(() => {});

  test("Should run command on script:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/meters/run/${meterId}`)
      .set("Authorization", token)
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromMeter.text).toMatch(
      '{"temperature": "21", "humidity": "55"}'
    );
  });

  test("Should return error if file not exists:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/meters/run/${meterWithNonExistingScriptId}`)
      .set("Authorization", token)
      .expect(500)
      .expect("Content-Type", /application\/json/);

    expect(Object.keys(responseFromMeter.body)[0]).toMatch(
      "Error occured during switching on"
    );
  });

  afterAll(async () => {
    if (environment === "test_api_database"){
      await app.databaseInstance?.connection.close();}
      await app.appServer.stopServer();
  });
});
