import Koa from "koa";
import sanitizedConfig from "../config/config";
import cors from "koa-cors";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cron from "node-cron";

import { exec } from "child_process";
import util from "util";
import { TaskService } from "./TaskService";

import { TaskManager } from "./TaskManager";
import { Switch } from "./domain/Switch";
import { v4 } from "uuid";
import { DeviceMapManager } from "./domain/DeviceMapManager";
import { DeviceRunManager } from "./Infrastructure/device/DeviceRunManager";
import { DeviceRunService } from "./application/device/DeviceRunService";
import { Task } from "./domain/Task";
import { MongoDatabase } from "./Infrastructure/databse/DataBase";
import { AppCron } from "./cron";
import { DeviceManager } from "./Infrastructure/device/DeviceManager";
import { DeviceService } from "./application/device/DeviceService";
import { Device } from "./domain/Device";
import { Meter, MeterParameters } from "./domain/Meter";
import { AggregatedTask } from "./domain/AggregatedTask";
const execAsync = util.promisify(exec);

interface DeviceRequest {
  deviceType: string;
}

class AppServer {
  private server: Koa;
  appRouter: Router;
  constructor(appRouter: Router) {
    this.appRouter = appRouter;
    this.server = this.initServer();
  }

  initServer(): Koa {
    const app = new Koa();
    app.use(cors());
    app.use(bodyParser());
    app.use(appRouter.routes());
    return app;
  }

  startServer() {
    this.server.listen(sanitizedConfig.PORT, () => {
      console.log(`Server listen at port ${sanitizedConfig.PORT}`);
    });
  }
}

const appRouter = new Router();
appRouter.get("/runmeter/:id", runMeter);
appRouter.post("/tasks", createTask);
appRouter.get("/task", getTask);
appRouter.post("/runswitcher", runSwitch);
appRouter.post("/devices", addDevice);
appRouter.get("/meters", getMeters);
appRouter.get("/switches", getSwitches);
appRouter.get("/tasks/device/:id", getTasksWhereDeviceId);


appRouter.delete("/task/:id", deleteTask);

const myServer = new AppServer(appRouter);

export async function executeForeignScriptAndReadLinePrint(
  command: string
): Promise<string> {
  try {
    console.log("command", command);
    const { stdout } = await execAsync(command);
    return Promise.resolve(stdout);
  } catch (err) {
    console.log("Standard out error", err);
    return Promise.reject(`No valid data to present`);
  }
}

async function runMeter(ctx: Koa.Context) {
  const meterId = await ctx.params.id;
  if (!meterId) {
    ctx.status = 400;
    return (ctx.body = {
      "Bad request": "Meter id mast be passed as url parameter",
    });
  }

  const meter = deviceMap.devices.get(meterId);
  if (meter) {
    const result = await deviceRunService.switchOn(meter);
    ctx.body = result;
  }
}

export const database = new MongoDatabase(
  sanitizedConfig.MONGO_URI,
  sanitizedConfig.DATABASE
);
const taskDoc = database.createTaskerDoc();
const deviceDoc = database.createDeviceDoc();
const deviceMap = new DeviceMapManager();

const deviceManager = new DeviceManager(deviceDoc, deviceMap);
const deviceService = new DeviceService(deviceManager);

const appCorn = new AppCron();

const taskManager = new TaskManager(taskDoc, appCorn);
const taskService = new TaskService(taskManager);

(async function fillDeviceMapWithData() {
  const meters = await deviceService.getMeterList();
  const switches = await deviceService.getSwitchList();
  meters.forEach((meter: Meter) => {
    deviceMap.addDevice(meter);
  });
  switches.forEach((switchDevice: Switch) => {
    deviceMap.addDevice(switchDevice);
  });
})();


(async function fillCronMapWithData() {
  const tasks = await taskService.findAllTask()
  tasks?.forEach((task: AggregatedTask) => {
    taskService.addTaskToCron(task)
  });
})();





function isMeter(maybeMeter: Meter) {
  const expectedParameters = ["deviceType", "name", "parameters", "commandOn"];
  function checkIfNotExceededParams() {
    for (const key in maybeMeter) {
      if (!expectedParameters.includes(key)) {
        return false;
      }
    }
    return true;
  }

  function checkIfNotMissingParams() {
    for (const param of expectedParameters) {
      if (!maybeMeter.hasOwnProperty(param)) {
        return false;
      }
    }

    return true;
  }

  function chackIfParameterParamValid() {
    for (const key in maybeMeter.parameters) {
      if (
        typeof key !== "string" ||
        typeof maybeMeter.parameters[key] !== "string"
      ) {
        return false;
      }
    }
    return true;
  }

  return (
    checkIfNotExceededParams() &&
    checkIfNotMissingParams() &&
    chackIfParameterParamValid() &&
    typeof maybeMeter.name === "string" &&
    typeof maybeMeter.commandOn === "string"
  );
}

function isSwitch(maybeSwitch: Switch) {
  const expectedParameters = ["deviceType", "name", "commandOn", "commandOff"];
  function checkIfNotExceededParams() {
    for (const key in maybeSwitch) {
      if (!expectedParameters.includes(key)) {
        return false;
      }
    }
    return true;
  }

  function checkIfNotMissingParams() {
    for (const param of expectedParameters) {
      if (!maybeSwitch.hasOwnProperty(param)) {
        return false;
      }
    }

    return true;
  }

  return (
    checkIfNotExceededParams() &&
    checkIfNotMissingParams() &&
    //checkIfStringValues()
    typeof maybeSwitch.name === "string" &&
    typeof maybeSwitch.commandOn === "string" &&
    typeof maybeSwitch.commandOff === "string"
  );
}

async function addDevice(ctx: Koa.Context) {
  const body = await ctx.request.body;
  const deviceType: string = (body as DeviceRequest).deviceType;

  let device: Device | null = null;
  if (deviceType == "switch") {
    const maybeSwitch = body as Switch;
    if (isSwitch(maybeSwitch)) {
      device = new Switch(
        v4(),
        maybeSwitch.deviceType,
        maybeSwitch.name,
        maybeSwitch.commandOn,
        maybeSwitch.commandOff as string
      );
      // TODO: recreate instance of this class if needed
    }
    // TODO: error
  } else if (deviceType == "meter") {
    const maybeMeter = body as Meter;
    if (isMeter(maybeMeter)) {
      device = new Meter(
        v4(),
        maybeMeter.deviceType,
        maybeMeter.name,
        maybeMeter.parameters as MeterParameters,
        maybeMeter.commandOn
      );
    }
    // TODO: error
  } else {
    // TODO: error unknown device type
  }

  if (device) {
    const result = await deviceService.addDeviceToDB(device);
    ctx.status = 201;
    ctx.body = { deviceId: result };
    console.log(deviceMap.devices);
  }
}


async function createTask(ctx: Koa.Context) {
  console.log("bef");
  const data = (await ctx.request.body) as Task;
  console.log(data, typeof data.scheduledTime.minutes)
  /*
  if (typeof data.onStatus !== "boolean") {
    ctx.status = 400;
    ctx.body = { response: "onStatus must be true or false" };
  }
*/

  console.log("aftre");
  const taskId = v4();

  const task = new Task(
    taskId,
    data.deviceId,
    data.onStatus,
    data.scheduledTime
  );
  console.log(task);
  const result = await taskService.addTaskToDB(task);
  
  
  if (result) {
    console.log(cron.getTasks());
    ctx.body = { taskId: result };
  } else {
    console.log("task in crone not installed");
    ctx.body = { error: "task in crone not installed" };
  }
  
}

async function getTask() {
  const result = await taskService.findTaskById("task");
  console.log(result);
}

async function getMeters(ctx: Koa.Context) {
  const result = await deviceService.getMeterList();
  console.log(result);
  ctx.body = result;
}

async function getSwitches(ctx: Koa.Context) {
  const result = await deviceService.getSwitchList();
  console.log(result);
  ctx.body = result;
}

const deviceRunManager = new DeviceRunManager();
const deviceRunService = new DeviceRunService(deviceRunManager);
//

appRouter.get("/tasks/device/:id", getMeters);

async function getTasksWhereDeviceId(ctx: Koa.Context){
  const deviceId = await ctx.params.id;
  if (!deviceId) {
    ctx.status = 400;
    return (ctx.body = {
      "Bad request": "Meter id mast be passed as url parameter",
    });
  }
  const tasks = await taskService.findTaskWhereDeviceId(deviceId)
  ctx.status = 201;
  ctx.body = tasks

}



async function runSwitch(ctx: Koa.Context) {
  const data = (await ctx.request.body) as {
    switchDeviceId: string;
    switchOn: boolean;
  };
  const switchDeviceId = data.switchDeviceId;
  const isTurnOn = data.switchOn;

  if (
    !switchDeviceId ||
    typeof switchDeviceId !== "string" ||
    isTurnOn === null ||
    typeof isTurnOn !== "boolean"
  ) {
    ctx.status = 400;
    return (ctx.body = {
      "Bad request": "switchDeviceId: string and switchOn: boolean required",
    });
  }

  let response = "";
  const switchDevice = deviceMap.devices.get(data.switchDeviceId);
  if (data.switchOn && switchDevice) {
    response = await deviceRunService.switchOn(switchDevice);
  }
  if (!data.switchOn && switchDevice) {
    response = await deviceRunService.switchOff(switchDevice as Switch);
  }

  ctx.body = response;
}

async function deleteTask(ctx: Koa.Context) {
  const taskId = ctx.params.id;
  console.log("taskid", taskId);
  const taskmap = cron.getTasks();
  taskmap.delete(taskId);
  console.log("crontaskmap", cron.getTasks());
}

myServer.startServer();
