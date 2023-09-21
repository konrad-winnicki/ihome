import request from "supertest";
import { Application, applicationStart } from "../../src/app";
import { describe, test, afterAll, beforeEach, beforeAll, expect} from "@jest/globals";
import { cleanupDatabase } from "../auxilaryFunctionsForTests/cleanup";
import { getUserFromDB } from "../auxilaryFunctionsForTests/getUser";
import sanitizedConfig from "../../config/config";
import { createUser } from "../auxilaryFunctionsForTests/createUser";

const requestUri = `http://localhost:${sanitizedConfig.PORT}`;

describe("API CREATE USER TEST", () => {
  let app: Application;

  beforeAll(async () => {
    app = await applicationStart();
    
  });
  beforeEach(async () => {
    await cleanupDatabase(app.connection);
  });

  test("Should create user:", async () => {
    const response = await request(requestUri)
      .post("/api/users")
      .send({
        password: "first password",
        email: "mafalda@op.pl",
        nickName: "first user",
      })
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const userFromDB = await getUserFromDB(app.connection, 'mafalda@op.pl')
    const regDate = new Date().toISOString().slice(0, 13);
    if (userFromDB) {
      const {
        nickName,
        id,
        email,
        registrationDate,
      } = userFromDB;
      const registrationDateFromDB = new Date(registrationDate)
        .toISOString()
        .slice(0, 13);

      expect(id).toBe(response.body.User_id);
      expect(regDate).toBe(registrationDateFromDB);
      expect(nickName).toBe("first user");
      expect(email).toBe("mafalda@op.pl");
    }
  });

  test("Should fail if reques body lacks nickname", async () => {
    await request(requestUri)
      .post("/api/users/")
      .send({ password: "password", email: "mafalda@op.pl" })
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("Should fail if reques body lacks email", async () => {
    await request(requestUri)
      .post("/api/users/")
      .send({ password: "password", nickName: "mafalda" })
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("Should fail if request body lacks password:", async () => {
    await request(requestUri)
      .post("/api/users/")
      .send({ email: "mafalda@op.pl", nickName: "user" })
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("Should return conflict if name exists:", async () => {
    await createUser(requestUri, "mafalda3@op.pl", "mafalda",  "password",);
    
    await request(requestUri)
      .post("/api/users")
      .send({ password: "password", email: "riki@op.pl", nickName: "mafalda" })
      .expect(409)
      .expect("Content-Type", /application\/json/);
      
  });
  

  test("Should return conflict if email exists:", async () => {
    await createUser(requestUri, "escala@op.pl", "mafalda",  "password" );
    await request(requestUri)
      .post("/api/users")
      .send({ password: "password", email: "escala@op.pl", nickName: "riki" })
      .expect(409)
      .expect("Content-Type", /application\/json/);
  });


  test("Should return ValidationError if wrong email format:", async () => {
    await request(requestUri)
      .post("/api/users")
      .send({ name: "riki", password: "password", email: "mafaldaop.pl" })
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  afterAll(async () => {
    app.stop();
  });
  
});
