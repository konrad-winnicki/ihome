import request from "supertest";
import { describe, afterAll, beforeAll, it } from "@jest/globals";
import sanitizedConfig from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
const requestUri = `http://localhost:${sanitizedConfig.PORT}`;

describe("API HANDLE LOGIN TEST", () => {
  let app: Application;
  beforeAll(async () => {
    app = await initializeDependencias();
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
    await app.databaseInstance.connection.close();
    await app.appServer.stopServer();
  });
});
