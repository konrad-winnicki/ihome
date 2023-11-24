import request from "supertest";
import { describe, afterAll, beforeAll, it } from "@jest/globals";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import cron from "node-cron";
import { cleanupFiles } from "./auxilaryFunctionsForTests/fileCleanup";
import { getEnvironmentType } from "../../../config/config";

const environment = getEnvironmentType()

describe("API HANDLE LOGIN TEST", () => {
  let app: Application;
  let requestUri: string
  beforeAll(async () => {
    app = await initializeDependencias();
    requestUri = `http://localhost:${appConfiguration.PORT}`;

  });
  

  it("Should login user", async () => {
    const response = await request(requestUri)
      .post("/login")
      .send({ password: "testPassword" })
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toHaveProperty("token");
  });

  it("should return an authorization error with wrong password", async () => {
    const response = await request(requestUri)
      .post("/login")
      .send({ password: "wrong_password" })
      .expect(401)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toEqual({ Error: "Wrong password" });
  });

  afterAll(async () => {
    if (environment === "test_api_database"){
      //await app.databaseInstance?.connection.dropDatabase()
      await app.databaseInstance?.connection.close();}
      if (environment === "test_api_file") {
        await cleanupFiles(['devices.json', 'tasks.json']);
      }
      cron.getTasks().forEach((task) => task.stop());
      cron.getTasks().clear();
      await app.appServer.stopServer();
  });
});
