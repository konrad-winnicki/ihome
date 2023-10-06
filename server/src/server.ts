import Koa from "koa";
import sanitizedConfig from "../config/config";
import cors from "koa-cors";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { TaskService } from "./application/task/TaskService";
import { TaskManager } from "./Infrastructure/task/TaskManager";
import { Switch } from "./domain/Switch";
import { DeviceInMemory } from "./domain/DeviceInMemory";
import { DeviceRunManager } from "./Infrastructure/device/DeviceRunManager";
import { DeviceRunService } from "./application/device/DeviceRunService";
import { MongoDatabase } from "./Infrastructure/databse/DataBase";
import { AppCron } from "./domain/AppCron";
import { DeviceManager } from "./Infrastructure/device/DeviceManager";
import { DeviceService } from "./application/device/DeviceService";
import { Meter } from "./domain/Meter";
import { addDevice } from "./controllers/addDevice/addDevice";
import { runMeter } from "./controllers/runDevices/runMeter";
import { runSwitch } from "./controllers/runDevices/runSwitch";
import { MongoDeviceManager } from "./Infrastructure/device/MongoDeviceManager";
import { InMemoryDeviceManager } from "./Infrastructure/device/InMemoryDeviceManager";
import { deleteDevice } from "./controllers/deleteDevice/deleteDevice";
import { EventEmitter } from "node:events";
import { CronTaskManager } from "./Infrastructure/task/CronTaskManager";
import { MongoTaskManager } from "./Infrastructure/task/MongoTaskManager";
import { getMeters } from "./controllers/getDeviceList/getMeters";
import { getSwitches } from "./controllers/getDeviceList/getSwitches";
import { createTask } from "./controllers/addTask/addTask";
import { deleteTask } from "./controllers/deleteTask/deleteTask";

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
appRouter.post("/meters/run/:id", runMeter);
appRouter.post("/tasks", createTask);
appRouter.delete("/tasks/:id", deleteTask);
appRouter.post("/switches/run/:id", runSwitch);
appRouter.post("/devices", addDevice);
appRouter.get("/meters", getMeters);
appRouter.get("/switches", getSwitches);
appRouter.get("/tasks/device/:id", getTasksForDevice);
appRouter.delete("/devices/:id", deleteDevice);

const myServer = new AppServer(appRouter);

export const database = new MongoDatabase(
  sanitizedConfig.MONGO_URI,
  sanitizedConfig.DATABASE
);
const taskDoc = database.createTaskerDoc();
const deviceDoc = database.createDeviceDoc();
export const devicesInMemory = DeviceInMemory.getInstance();

const inMemoryDeviceManager = new InMemoryDeviceManager(devicesInMemory);
const mongoDeviceManager = new MongoDeviceManager(
  inMemoryDeviceManager,
  deviceDoc
);
const deviceManager = new DeviceManager(mongoDeviceManager);
export const deviceService = new DeviceService(deviceManager);

const appCorn = new AppCron();
export const eventEmitter = new EventEmitter();

const mongoTaskManager = new MongoTaskManager(taskDoc);
const cronTaskManager = new CronTaskManager(mongoTaskManager, appCorn);
const taskManager = new TaskManager(cronTaskManager, eventEmitter);
export const taskService = new TaskService(taskManager);

(async function fillDeviceInMemoryWithData() {
  const meters = await deviceService.getMeterList();
  const switches = await deviceService.getSwitchList();
  meters.forEach((meter: Meter) => {
    devicesInMemory.addDevice(meter);
  });
  switches.forEach((switchDevice: Switch) => {
    devicesInMemory.addDevice(switchDevice);
  });
})();
//
export async function fillCronInMemoryWithData() {
  taskService.transformTaskFromDbToCron();
  //TODO: what when server restart but this fails?
}

fillCronInMemoryWithData();

const deviceRunManager = new DeviceRunManager();
export const deviceRunService = new DeviceRunService(deviceRunManager);

async function getTasksForDevice(ctx: Koa.Context) {
  const deviceId = await ctx.params.id;
  if (!deviceId) {
    ctx.status = 400;
    return (ctx.body = {
      "Bad request": "Meter id mast be passed as url parameter",
    });
  }
  const tasks = await taskService.findTasksForDevice(deviceId);
  ctx.status = 201;
  ctx.body = tasks;
}

myServer.startServer();

/*
class Singleton {
  private static instance: Singleton | null = null;
  private data: string;

  private constructor(data: string) {
    this.data = data;
  }

  public static getInstance(data: string): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton(data);
    }
    return Singleton.instance;
    //throw new Error ('instance exists')}
  }

  public getData(): string {
    return this.data;
  }
}

const singleton1 = Singleton.getInstance("ala ma kota");
console.log(singleton1.getData()); // Outputs: This is the singleton instance.

async function f1(param: string) {
  if (param === "a") {
    return Promise.resolve("resolved f1");
  }
  return Promise.reject("uniqueError");
}

function compensate(param: string): Promise<string> {
  if (param == "ok") {
    return Promise.resolve("ok");
  }
  console.log("log");
  return Promise.reject("notOK");
}

async function f2() {
  return f1("a")
    .then(() => "ala ma kota")

    .catch((err) => {
      return (
        compensate("ok")
          .then((err) => Promise.reject(err))
          //.catch((err) => Promise.reject(err))

          .catch(() => {
            if (err === "uniqueError") {
              console.log("if in unique");
              const res = provideMongoError(err);
              return Promise.reject(`resss ${res}`);
            }

            return Promise.reject(err);
          })
      );

      //.then(()=>Promise.reject(err)).catch(()=>Promise.reject(err))
    });
  //.catch((err)=> {compensate("notOK")})
}

f2()
  .then((res) => console.log(res))
  .catch((r) => console.log(r));

function provideMongoError(err: string) {
  console.log("provider");
  return `uniqueError`;
}

function prom() {
  return Promise.reject("a");
}

function ret(): Promise<string> {
  return prom()
    .then((res) => Promise.resolve(res))
    .catch((res) => {
      const a = "dupa";
      return Promise.reject(`ddddddd ${res}`);
    });
}

ret()
  .then((res) => console.log("resolved", res))
  .catch((res) => console.log("rejected", res));
*/
