import request from "supertest";
import { describe, afterAll, beforeAll } from "@jest/globals";
import sanitizedConfig from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/cleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { addSwitch } from "./auxilaryFunctionsForTests/addSwitch";
import { exec } from "node:child_process";
import util from "util";

const requestUri = `http://localhost:${sanitizedConfig.PORT}`;

describe("API RUN SWITCH TEST", () => {
  let app: Application;
  let token: string;
  let switchId: string;
  let switchWithNonExistingScriptId: string;
  let listeningSwitch: string;
  let switchWithNoPrint: string;
  beforeAll(async () => {
    app = await initializeDependencias();
    await cleanupDatabase(app.databaseInstance.connection);
    app.devicesInMemory.devices.clear();
    token = await loginUser(requestUri, "testPassword");
    switchId = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch1",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchOn.sh",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchOff.sh"
    );

    switchWithNonExistingScriptId = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch2",
      ". ./src/__tests__/apiTests/shellScripts/nonExisiting.sh",
      ". ./src/__tests__/apiTests/shellScripts/nonExisting.sh"
    );
    listeningSwitch = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch3",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchWithDelay.sh",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchOff.sh"
    );
    switchWithNoPrint = await addSwitch(
      requestUri,
      token,
      "switch",
      "switch4",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchWithNoPrint.sh",
      ". ./src/__tests__/apiTests/shellScripts/runSwitchOff.sh"
    );
  });

  test("Should run command on script:", async () => {
    const responseFromSwitch = await request(requestUri)
      .post(`/switches/run/${switchId}`)
      .set("Authorization", token)
      .send({ switchOn: true })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromSwitch.text).toMatch("switch on");
  });

  test("Should run command off script:", async () => {
    const responseFromSwitch = await request(requestUri)
      .post(`/switches/run/${switchId}`)
      .set("Authorization", token)
      .send({ switchOn: false })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromSwitch.text).toMatch("switch off");
  });

  test("Switch on should return error if file not exists:", async () => {
    const responseFromSwitch = await request(requestUri)
      .post(`/switches/run/${switchWithNonExistingScriptId}`)
      .set("Authorization", token)
      .send({ switchOn: true })
      .expect(500)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromSwitch.text).toMatch("Acomplished with error:");
  });

  test("Switch off should return error if file not exists:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/switches/run/${switchWithNonExistingScriptId}`)
      .set("Authorization", token)
      .send({ switchOn: false })
      .expect(500)
      .expect("Content-Type", /text\/plain/);

    console.log(responseFromMeter.text);
    expect(responseFromMeter.text).toMatch("Acomplished with error:");
  });

  test("Should resolve promise even if process not ended:", async () => {
    //jest.useFakeTimers()
    // jest.advanceTimersByTime(10)

    const execAsync = util.promisify(exec);
    const responseFromMeter = await request(requestUri)
      .post(`/switches/run/${listeningSwitch}`)
      .set("Authorization", token)
      .send({ switchOn: true })
      .expect(200)
      .expect("Content-Type", /text\/plain/);
/*
    try {
      const { stdout } = await execAsync(`pgrep -f runSwitchWithDelay.sh`);
      console.log(stdout);
      await execAsync(`kill -TERM ${stdout}`);
      // const responseFromMeter = await responseFromMeterPromise;
      
    } catch (error) {
      console.log(error);
      throw error;
    }
*/
    expect(responseFromMeter.text).toMatch(
      "Proccess not ended. Not waiting more for stdout."
    );
  });

  test("Should resolve promise even if process not printed message:", async () => {
    const responseFromMeter = await request(requestUri)
      .post(`/switches/run/${switchWithNoPrint}`)
      .set("Authorization", token)
      .send({ switchOn: true })
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromMeter.text).toMatch(
      "Acomplished succesfuly but not data collected"
    );
  });

  afterAll(async () => {
    await app.databaseInstance.connection.close();
    await app.appServer.stopServer();
  });
});
