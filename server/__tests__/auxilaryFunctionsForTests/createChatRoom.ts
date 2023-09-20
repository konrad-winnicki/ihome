import request from "supertest";

export async function createChatRoom(requestUri:string, token:string, userId: string, chatName: string) {
  const response = await request(requestUri)
  .post("/api/chatrooms")
  .set("Authorization", token)
  .send({ ownerId: userId, chatName });
    return response;
  }