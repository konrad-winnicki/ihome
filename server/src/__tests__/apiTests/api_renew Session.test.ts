import request from "supertest";
import { describe, afterAll, beforeAll, it } from "@jest/globals";
import { getEnvironmentType } from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
//import appConfiguration from "../../../config/sanitizedProperties";
import cron from "node-cron";
import { cleanupFiles } from "./auxilaryFunctionsForTests/fileCleanup";
import { tokenExpirationTimeInSeconds } from "../../domain/tokenGenerator";

const environment = getEnvironmentType()

describe("API RENEW SESSION TEST", () => {
  let app: Application;
  let token: string;
  let requestUri: string;
  const tokenExpirationTimeInMS = tokenExpirationTimeInSeconds * 1000;
  const bufferMiliecondsBeforeEnd = 240000;
  beforeAll(async () => {
    app = await initializeDependencias();
    requestUri = `http://localhost:${appConfiguration.PORT}`;

    token = await loginUser(requestUri, "testPassword");
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("Should return new token", async () => {
    jest.advanceTimersByTime(
      tokenExpirationTimeInMS - bufferMiliecondsBeforeEnd
    );

    const response = await request(requestUri)
      .get("/renew")
      .set("Authorization", token)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toHaveProperty("token");
  });
  it("Should not return token if provious token expired", async () => {
    jest.advanceTimersByTime(
      tokenExpirationTimeInMS + bufferMiliecondsBeforeEnd
    );

    const response = await request(requestUri)
      .get("/renew")
      .set("Authorization", token)
      .expect(401)
      .expect("Content-Type", /application\/json/);
    console.log(response.body);
    expect(response.body).toEqual({ "Token validation error": "jwt expired" });
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
