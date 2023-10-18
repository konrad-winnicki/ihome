import request from "supertest";
import { describe, afterAll, beforeAll } from "@jest/globals";
import sanitizedConfig from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/cleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { addMeter } from "./auxilaryFunctionsForTests/addMeter";
const requestUri = `http://localhost:${sanitizedConfig.PORT}`;

describe("API RUN METER TEST", () => {
  let app: Application;
  let token: string;
  let meterId: string;
  let meterWithNonExistingScriptId: string;

  beforeAll(async () => {
    app = await initializeDependencias();
    token = await loginUser(requestUri, "testPassword");
    await cleanupDatabase(app.databaseInstance.connection);
    app.devicesInMemory.devices.clear();

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

  afterAll(() => {
  });

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
      .expect("Content-Type", /text\/plain/);

    console.log(responseFromMeter.text);
    expect(responseFromMeter.text).toMatch("Acomplished with error:");
  });

  afterAll(async () => {
    await app.databaseInstance.connection.close();
    await app.appServer.stopServer();
  });
});
