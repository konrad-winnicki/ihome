import request from "supertest";
import { Application, applicationStart } from "../../src/app";
import { describe, test, afterAll, beforeEach, beforeAll, expect } from "@jest/globals";
import { cleanupDatabase } from "../auxilaryFunctionsForTests/cleanup";
import sanitizedConfig from "../../config/config";
import { createUser } from "../auxilaryFunctionsForTests/createUser";
import { loginUser } from "../auxilaryFunctionsForTests/loginUser";
import { getChatRoomFromDB } from "../auxilaryFunctionsForTests/getChatRoom";
import { createChatRoom } from "../auxilaryFunctionsForTests/createChatRoom";

const requestUri = `http://localhost:${sanitizedConfig.PORT}`;

describe("API CREATE USER TEST", () => {
  let app: Application;
  let token:string
  let userId:string

  beforeAll(async () => {
    app = await applicationStart();
    
  });
  beforeEach(async () => {
    await cleanupDatabase(app.connection);
    const response = createUser(requestUri, "mafalda@op.pl", "mafalda", "password")
    userId = (await response).body.User_id
    token = await loginUser(requestUri, "mafalda@op.pl", "password")

  });

  test("Should create chatRoom:", async () => {
    const chatName = "Room1"
    const response = await request(requestUri)
      .post("/api/chatrooms")
      .set("Authorization", token)
      .send({ ownerId: userId, chatName })
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const chatRoomFromDB = await getChatRoomFromDB(app.connection, 'Room1')
    const regDate = new Date().toISOString().slice(0, 13);
    if (chatRoomFromDB) {
      const {
        name,
        id,
        ownerId,
        creationDate,
      } = chatRoomFromDB;
      const registrationDateFromDB = new Date(creationDate)
        .toISOString()
        .slice(0, 13);

        expect(id).toBe(response.body.chatRoom_id)
      expect(ownerId).toBe(userId);
      expect(regDate).toBe(registrationDateFromDB);
      expect(name).toBe("Room1");
    }
  });


  test("Should return confict if name exists:", async () => {
    await createChatRoom(requestUri, token, userId, "Room1")
    await request(requestUri)
      .post('/api/chatrooms/')
      .set('Authorization', token)
      .send({ ownerId: userId, chatName: "Room1" })
      .expect(409)
      .expect("Content-Type", /application\/json/);
  });

  test("Should fail with 500 if not valid token", async () => {
const notValidToken = "token"
    const chatName = "Room1"
   await request(requestUri)
      .post("/api/chatrooms")
      .set("Authorization", notValidToken )
      .send({ ownerId: userId, chatName })
      .expect(500)
      .expect("Content-Type", /application\/json/);

  });
  test("Should fail with 401 if no token", async () => {
        const chatName = "Room1"
       await request(requestUri)
          .post("/api/chatrooms")
          .send({ ownerId: userId, chatName })
          .expect(401)
          .expect("Content-Type", /application\/json/);
    
      });

  
  afterAll(async () => {
    app.stop();
  });
  
});
