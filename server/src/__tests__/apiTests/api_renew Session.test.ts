import request from "supertest";
import { describe, afterAll, beforeAll, it } from "@jest/globals";
import sanitizedConfig from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";

const requestUri = `http://localhost:${sanitizedConfig.PORT}`;

describe("API RENEW SESSION TEST", () => {
  let app: Application;
  let token: string;
  const tokenExpirationTimeInMS = 360000
  const manipulationTimeInMS = 10000
  beforeAll(async () => {
    app = await initializeDependencias();
    token = await loginUser(requestUri, "testPassword");
    jest.useFakeTimers();

  });

  afterAll(()=>{
    jest.useRealTimers()

  })

  
  it("Should return new token", async () => {
    jest.advanceTimersByTime(tokenExpirationTimeInMS - manipulationTimeInMS);

    const response = await request(requestUri)
      .get("/renew")
      .set("Authorization", token)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toHaveProperty('token');
  });
  it("Should not return token if provious token expired", async () => {
    jest.advanceTimersByTime(tokenExpirationTimeInMS + manipulationTimeInMS);

    const response = await request(requestUri)
      .get("/renew")
      .set("Authorization", token)
      .expect(401)
      .expect("Content-Type", /application\/json/);
      console.log(response.body)
    expect(response.body).toEqual({"Token validation error": "jwt expired"});
  });

 

  afterAll(async () => {
   await app.databaseInstance.connection.close();
    await app.appServer.stopServer();
  });
});
