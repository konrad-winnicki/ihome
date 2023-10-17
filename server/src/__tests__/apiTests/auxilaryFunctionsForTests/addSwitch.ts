import request from "supertest";

export async function addSwitch(
  requestUri: string,
  token: string,
  deviceType: string,
  name: string,
  commandOn: string,
  commandOff: string
) {
  const response = await request(requestUri)
    .post("/devices")
    .set("Authorization", token)
    .send({
      deviceType: deviceType,
      name: name,
      commandOn: commandOn,
      commandOff: commandOff,
    });
  return response.body.deviceId;
}
