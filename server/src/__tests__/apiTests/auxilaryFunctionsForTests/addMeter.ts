import request from "supertest";

type Parameters = {
  [key:string]:string,

}

export async function addMeter(
  requestUri: string,
  token: string,
  deviceType: string,
  name: string,
  parameters:Parameters,
  commandOn: string,
  
) {
  const response = await request(requestUri)
    .post("/devices")
    .set("Authorization", token)

    .send({
      deviceType: deviceType,
      name: name,
      parameters: parameters,
      commandOn: commandOn,

    });
  return response.body.deviceId;
}
