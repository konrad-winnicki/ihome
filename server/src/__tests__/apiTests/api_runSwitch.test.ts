import request from "supertest";
import { describe, afterAll,  beforeAll } from "@jest/globals";
import sanitizedConfig from "../../../config/config";
import { initializeDependencias } from "../../dependencias";
import { Application } from "../../dependencias";
import { cleanupDatabase } from "./auxilaryFunctionsForTests/cleanup";
import { loginUser } from "./auxilaryFunctionsForTests/loginUser";
import { addSwitch } from "./auxilaryFunctionsForTests/addSwitch";
const requestUri = `http://localhost:${sanitizedConfig.PORT}`;

describe("API RUN SWITCH TEST", () => {
  
  let app: Application;
  let token: string;
  let switchId: string;
  let switchWithNonExistingScriptId: string
  //let listeningSwitch: string
  let switchWithNoPrint:string
  const timeOutPromiseDelay = 60000

  beforeAll(async () => {
    app = await initializeDependencias();
    await cleanupDatabase(app.databaseInstance.connection);
    app.devicesInMemory.devices.clear();
    token = await loginUser(requestUri, "testPassword")
    switchId = await addSwitch(requestUri, token, "switch", "switch1", "source ./src/__tests__/apiTests/shellScripts/runSwitchOn.sh", "source ./src/__tests__/apiTests/shellScripts/runSwitchOff.sh")

    switchWithNonExistingScriptId = await addSwitch(requestUri, token, "switch", "switch2", "source ./src/__tests__/apiTests/shellScripts/nonExisiting.sh", "source ./src/__tests__/apiTests/shellScripts/nonExisting.sh")
    //listeningSwitch = await addSwitch(requestUri, token, "switch", "switch3", "source ./src/__tests__/apiTests/shellScripts/runSwitchWithDelay.sh", "source ./src/__tests__/apiTests/shellScripts/runSwitchOff.sh")
    switchWithNoPrint = await addSwitch(requestUri, token, "switch", "switch4", "source ./src/__tests__/apiTests/shellScripts/runSwitchWithNoPrint.sh", "source ./src/__tests__/apiTests/shellScripts/runSwitchOff.sh")

    jest.useFakeTimers();

  });
 


  afterAll(()=>{
    jest.useRealTimers()

  })

  test("Should run command on script:", async () => {
    jest.advanceTimersByTime(timeOutPromiseDelay);

    const responseFromSwitch = await request(requestUri)
      .post(`/switches/run/${switchId}`)
      .set("Authorization", token)
      .send({switchOn:true})
      .expect(200)
      .expect("Content-Type", /text\/plain/);


    expect(responseFromSwitch.text).toMatch(
      'switch on'
    );
  });

  test("Should run command off script:", async () => {
    jest.advanceTimersByTime(timeOutPromiseDelay);

    const responseFromSwitch = await request(requestUri)
      .post(`/switches/run/${switchId}`)
      .set("Authorization", token)
      .send({switchOn:false})
      .expect(200)
      .expect("Content-Type", /text\/plain/);

    expect(responseFromSwitch.text).toMatch(
      'switch off'
    );
  });



  test("Switch on should return error if file not exists:", async () => {
    jest.advanceTimersByTime(timeOutPromiseDelay);

    const responseFromSwitch = await request(requestUri)
      .post(`/switches/run/${switchWithNonExistingScriptId}`)
      .set("Authorization", token)
      .send({switchOn:true})
      .expect(500)
      .expect("Content-Type", /text\/plain/);

   expect(responseFromSwitch.text).toMatch('Acomplished with error:')
  });


  test("Switch off should return error if file not exists:", async () => {
    jest.advanceTimersByTime(timeOutPromiseDelay);
    const responseFromMeter = await request(requestUri)
      .post(`/switches/run/${switchWithNonExistingScriptId}`)
      .set("Authorization", token)
      .send({switchOn:false})
      .expect(500)
      .expect("Content-Type", /text\/plain/);

   console.log(responseFromMeter.text)
   expect(responseFromMeter.text).toMatch('Acomplished with error:')
  });


  

/*
  test("Should resolve promise even if process not ended:", async () => {
//jest.useRealTimers()
jest.advanceTimersByTime(timeOutPromiseDelay+10000);


    const responseFromMeter =  await request(requestUri)
      .post(`/switches/run/${listeningSwitch}`)
      .set("Authorization", token)
      .send({switchOn:true})
      .expect(200)
      .expect("Content-Type", /text\/plain/);

   console.log('listening',responseFromMeter.text)
   expect(responseFromMeter.text).toMatch('Proccess not ended. Not waiting more for stdout.')
  });
  
*/
  test("Should resolve promise even if process not printed message:", async () => {
    jest.advanceTimersByTime(timeOutPromiseDelay);

    const responseFromMeter = await request(requestUri)
      .post(`/switches/run/${switchWithNoPrint}`)
      .set("Authorization", token)
      .send({switchOn:true})
      .expect(200)
      .expect("Content-Type", /text\/plain/);

   expect(responseFromMeter.text).toMatch('Acomplished succesfuly but not data collected')
  });

  afterAll(async () => {
    await app.databaseInstance.connection.close();
    await app.appServer.stopServer();
  });
});
