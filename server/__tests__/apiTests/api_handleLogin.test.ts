import request from "supertest";
import { Application, applicationStart } from "../../src/app";
import { describe, afterAll, beforeEach, beforeAll, it} from "@jest/globals";
import { createUser } from "../auxilaryFunctionsForTests/createUser";
import { cleanupDatabase } from "../auxilaryFunctionsForTests/cleanup";
import config from "../../config/config";

const requestUri = `http://localhost:${config.PORT}`

describe("API HANDLE LOGIN TEST", () => {
  let app: Application

  beforeAll(async() =>{
    app = await applicationStart()   
  }
  );
  beforeEach(async () => {
    await cleanupDatabase(app.connection)

    await createUser(requestUri, "mafalda@op.pl", 'mafalda', 'password');
  });

  it("Should login user", async () => {
    await request(requestUri)
      .post("/api/login")
      .send({ password: "password", email: "mafalda@op.pl" })
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("should have an authorization error with wrong password", async () => {
    await request(requestUri)
      .post("/api/login")
      .send({ password: "test", email: "mafalda@op.pl" })
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });

  it("should have an authorization error with wrong email", async () => {
    await request(requestUri)
      .post("/api/login")
      .send({ password: "password", email: "wrongemail@op.pl" })
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });

  afterAll(async () => {
    app.stop()
  });
});
