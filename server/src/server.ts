import Koa from "koa";
import sanitizedConfig from "../config/config";
import cors from "koa-cors";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cron from "node-cron";

import { exec } from "child_process";
import util from "util";
import { TaskService } from "./application/task/TaskService";

import { TaskManager } from "./Infrastructure/task/TaskManager";
import { Switch } from "./domain/Switch";
import { v4 } from "uuid";
import { DeviceInMemory } from "./domain/DeviceInMemory";
import { DeviceRunManager } from "./Infrastructure/device/DeviceRunManager";
import { DeviceRunService } from "./application/device/DeviceRunService";
import { Task } from "./domain/Task";
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

const execAsync = util.promisify(exec);

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
appRouter.get("/task", getTask);
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

const inMemoryDeviceMenager = new InMemoryDeviceManager(devicesInMemory);
const mongoDeviceManager = new MongoDeviceManager(
  inMemoryDeviceMenager,
  deviceDoc
);
const deviceManager = new DeviceManager(mongoDeviceManager);

export const deviceService = new DeviceService(deviceManager);

const appCorn = new AppCron();
export const eventEmitter = new EventEmitter();

const mongoTaskManager = new MongoTaskManager(taskDoc);
const cronTaskManager = new CronTaskManager(mongoTaskManager, appCorn);
const taskManager = new TaskManager(cronTaskManager, eventEmitter);

const taskService = new TaskService(taskManager);

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
  //const tasks = await taskService.findAllTask();
  //tasks?.forEach((task: AggregatedTask) => {
  taskService.addTaskToCron();
  //});
}

fillCronInMemoryWithData();

async function createTask(ctx: Koa.Context) {
  console.log("bef");
  const data = (await ctx.request.body) as Task;
  console.log(data, typeof data.scheduledTime.minutes);
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
  const result = await taskService.transformTaskFromDbToCron(task);

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
export const deviceRunService = new DeviceRunService(deviceRunManager);
//

appRouter.get("/tasks/device/:id", getMeters);

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

async function deleteTask(ctx: Koa.Context) {
  const taskId = ctx.params.id;
  const response = await taskService.deleteTaskFromDB(taskId);
  if (response) {
    ctx.status = 201;
    ctx.body = { "Task deleted": response };
  }
}

myServer.startServer();

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



async function f1(param:string){
  if (param ==='a'){
    return Promise.resolve('resolved f1')
  }
return Promise.reject('Not added to casche')
}

async function f2 (){

  try{
    
    const res = await f1('v')
    console.log('before mongo')
    let param1 = "c"
  if(param1 ==='a'){
    throw new Error('mongo error')
  }
    return Promise.resolve(res)
  
  }catch(err){
    console.log('from error')
    if(err=="not error"){
     
    const e= provideMongoError(err as unknown as string)
    return Promise.reject(e)

  }

  return Promise.reject(`Not added to mongodue error: ${err}`)
}
}

f2().then((res)=>console.log(res)).catch((r)=>console.log(r))

function provideMongoError(err:string){
  return `error from provder`
}