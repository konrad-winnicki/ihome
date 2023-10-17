import request from "supertest";

export async function loginUser(requestUri:string, password:string) {
    const response = await request(requestUri)
      .post(`/login`)
      .send({password: password });
    return response.body.token;
  }