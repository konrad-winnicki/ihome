import request from "supertest";
import { Application, applicationStart } from "../../src/app";
import { describe, test, afterAll, beforeEach, expect, beforeAll } from "@jest/globals";
import { createUser } from "../auxilaryFunctionsForTests/createUser";
import { loginUser } from "../auxilaryFunctionsForTests/loginUser";
import { cleanupDatabase } from "../auxilaryFunctionsForTests/cleanup";
import config from "../../config/config";
import { createChatRoom } from "../auxilaryFunctionsForTests/createChatRoom";

const requestUri = `http://localhost:${config.PORT}`
describe("API GET CHATROOMS", () => {
  let app: Application
  let token:string
  let userId:string

  beforeAll(async() =>{
    app = await applicationStart();

    
  }
  );

  beforeEach(async () => {
    await cleanupDatabase(app.connection);
    const response = createUser(requestUri, "mafalda@op.pl", "mafalda", "password")
    userId = (await response).body.User_id
    token = await loginUser(requestUri, "mafalda@op.pl", "password") 
  });

  test("Should return list of chat rooms", async () => {
    const names = ["Room", "Funny Room", "Action Room", "Exchange Room"];
    const chatRoomWithId = []
    
    for (let i = 0; i < names.length; i++) {
       const response = await createChatRoom(requestUri, token, userId, names[i]);
       chatRoomWithId.push({chatRoomName: names[i], id:response.body.chatRoom_id, chatOwner:userId})
    }

    const sortedInput = chatRoomWithId.sort((a, b) => a.chatRoomName.localeCompare(b.chatRoomName))

    const response = await request(requestUri)
      .get(`/api/chatrooms`)
      .set("Authorization", token)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toStrictEqual(sortedInput);
  });

  afterAll(async () => {
    app.stop()
   
  });
});
