import request from "supertest";
import { describe, afterAll, beforeEach, beforeAll } from "@jest/globals";
import sanitizedConfig from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/cleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { getDevice } from "./auxilaryFunctionsForTests/getDevice";
import { addSwitch } from "./auxilaryFunctionsForTests/addSwitch";
import { getAllDevices } from "./auxilaryFunctionsForTests/getAllDevices";
const requestUri = `http://localhost:${sanitizedConfig.PORT}`;

describe("API DELETE DEVICE TEST", () => {
  let app: Application;
  let token: string;
  let switch1Id: string;
  let switch2Id: string;

  beforeAll(async () => {
    app = await initializeDependencias();
    token = await loginUser(requestUri, "testPassword");
  });

  beforeEach(async () => {
    await cleanupDatabase(app.databaseInstance.connection);
    app.devicesInMemory.devices.clear();

    switch1Id = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch1",
      "switch on",
      "switch off"
    );

    switch2Id = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch2",
      "switch on",
      "switch off"
    );
  });

  test("Should not delete device from database if wrong device Id:", async () => {
    const nonExisitingId = "nonExisitingId";
    const response = await request(requestUri)
      .delete(`/devices/${nonExisitingId}`)
      .set("Authorization", token)
      .expect(500)
      .expect("Content-Type", /application\/json/);
    const devicesInDB = await getAllDevices(app.databaseInstance.connection);

    const [device1, device2] = app.devicesInMemory.devices.values();
    expect(response.body).toEqual({
      "Device not deleted due to error":
      "Deletion failed due error: MemoryError: Device with nonExisitingId not exists.",
    });
    expect(devicesInDB).toMatchObject([
      {
        id: switch1Id,
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
      {
        id: switch2Id,
        deviceType: "switch",
        name: "switch2",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    ]);

    expect([device1, device2]).toMatchObject([
      {
        id: switch1Id,
        deviceType: "switch",
        name: "switch1",
        commandOn: "switch on",
        commandOff: "switch off",
      },
      {
        id: switch2Id,
        deviceType: "switch",
        name: "switch2",
        commandOn: "switch on",
        commandOff: "switch off",
      },
    ]);
  });

  test("Should delete switch from database and inMemoryStorage:", async () => {
    const response = await request(requestUri)
      .delete(`/devices/${switch1Id}`)
      .set("Authorization", token)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    const findDeteledItem = await getDevice(
      app.databaseInstance.connection,
      switch1Id
    );
    const deletedDeviceFromMemory = app.devicesInMemory.devices.get(switch1Id);
    expect(response.body).toEqual({ "Device deleted": "Device deleted succesfully." });
    expect(findDeteledItem).toEqual([]);
    expect(deletedDeviceFromMemory).toEqual(undefined);
  });

  test("Should not delete device if not valid token:", async () => {
    const wrongToken = "120394985";

    const response = await request(requestUri)
      .delete(`/devices/${switch1Id}`)
      .set("Authorization", wrongToken)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({
      "Token validation error":
        "During token verification error occured: JsonWebTokenError: jwt malformed",
    });
  });

  test("Should not delete device if token not provided", async () => {
    const response = await request(requestUri)
      .delete(`/devices/${switch1Id}`)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({
      Error: "Token reqired",
    });
  });
  afterAll(async () => {
    await app.databaseInstance.connection.close();
    await app.appServer.stopServer();
  });
});