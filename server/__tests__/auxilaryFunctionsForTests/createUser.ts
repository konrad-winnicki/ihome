import request from "supertest";

export async function createUser(requestUri:string, email: string, name: string, password: string) {
    const response = await request(requestUri)
      .post("/api/users/")
      .send({password: password, email: email,  nickName: name });
    return response;
  }