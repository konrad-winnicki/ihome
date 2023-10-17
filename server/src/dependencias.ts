import sanitizedConfig from "../config/config";
import { TaskService } from "./application/task/TaskService";
import { TaskManager } from "./Infrastructure/task/TaskManager";
import { DeviceRunManager } from "./Infrastructure/device/DeviceRunManager";
import { DeviceRunService } from "./application/device/DeviceRunService";
import { MongoDatabase } from "./Infrastructure/databse/MongoDataBase";
import { AppCron } from "./domain/AppCron";
import { MongoDeviceManager } from "./Infrastructure/device/MongoDeviceManager";
import { InMemoryDeviceManager } from "./Infrastructure/device/InMemoryDeviceManager";
import { EventEmitter } from "node:events";
import { CronTaskManager } from "./Infrastructure/task/CronTaskManager";
import { MongoTaskManager } from "./Infrastructure/task/MongoTaskManager";
import {
  recoveryInMemoryDeviceStorage,
  fillCronInMemoryWithData,
} from "./domain/inMemoryRecoveryFunctions";
import { AppServer } from "./Infrastructure/AppServer";
import { initAppRouter } from "./Infrastructure/routes";
import { InMemoryDeviceStorage } from "./domain/InMemoryDeviceStorage";
import { DeviceControllers } from "./controllers/DeviceControllers";
import { RunDeviceControllers } from "./controllers/runDeviceControllers";
import { TaskControllers } from "./controllers/TaskControllers";
import { LoginControllers } from "./controllers/LoginControllers";
import { tokenGenerator } from "./domain/tokenGenerator";

function createMongoDocs(database: MongoDatabase) {
  const deviceDoc = database.createDeviceDoc();
  const taskDoc = database.createTaskerDoc();
  return { deviceDoc, taskDoc };
}

export async function initializeDependencias() {
  const mongoDatabase = new MongoDatabase(
    sanitizedConfig.MONGO_URI,
    sanitizedConfig.DATABASE
  );

  const mongoDocs = createMongoDocs(mongoDatabase);
  const devicesInMemory = InMemoryDeviceStorage.getInstance();
  const inMemoryDeviceManager = new InMemoryDeviceManager(devicesInMemory);

  const eventEmitter = new EventEmitter();

  const deviceService = new MongoDeviceManager(
    inMemoryDeviceManager,
    mongoDocs.deviceDoc,
    eventEmitter
  );

  const mongoTaskManager = new MongoTaskManager(mongoDocs.taskDoc);
  const appCorn = new AppCron();
  const cronTaskManager = new CronTaskManager(mongoTaskManager, appCorn);

  const taskManager = new TaskManager(cronTaskManager, eventEmitter);
  const taskService = new TaskService(taskManager, deviceService);

  const deviceRunManager = new DeviceRunManager();
  const deviceRunService = new DeviceRunService(deviceRunManager);

  const deviceRunControllerDep = new RunDeviceControllers(
    deviceRunService,
    devicesInMemory
  );
  const deviceControllers = new DeviceControllers(deviceService);
  const taskControlles = new TaskControllers(taskService);
  const loginControllers = new LoginControllers(tokenGenerator);

  const appRouter = initAppRouter(
    deviceControllers,
    deviceRunControllerDep,
    taskControlles,
    loginControllers
  );

  const appServer = new AppServer(appRouter);

  await recoveryInMemoryDeviceStorage(deviceService, devicesInMemory);
  await fillCronInMemoryWithData(taskService);

  appServer
    .startServer()
    .then(() => console.log("server listen succes"))
    .catch((err) => console.log("error", err));

  return Application.getInstance(appServer, mongoDatabase, devicesInMemory);
}

export class Application {
  private static instance: Application | null = null;
  public appServer: AppServer;
  public databaseInstance: MongoDatabase;
  public devicesInMemory: InMemoryDeviceStorage;

  constructor(
    appServer: AppServer,
    databaseInstance: MongoDatabase,
    devicesInMemory: InMemoryDeviceStorage
  ) {
    this.appServer = appServer;
    this.databaseInstance = databaseInstance;
    this.devicesInMemory = devicesInMemory;
  }

  public static getInstance(
    appServer: AppServer,
    databaseInstance: MongoDatabase,
    devicesInMemory: InMemoryDeviceStorage
  ) {
    if (!Application.instance) {
      Application.instance = new Application(
        appServer,
        databaseInstance,
        devicesInMemory
      );
    }
    return Application.instance;
  }
}

//export const databaseInstance = initializeDatabaseInstance();
/*
const dependencias = initializeDependencias()
export const devicesInMemory = dependencias.devicesInMemory
export const deviceService = dependencias.deviceService
export const mongoTaskManager = dependencias.mongoTaskManager
export const cronTaskManager = dependencias.cronTaskManager
export const eventEmitter = dependencias.eventEmitter
export const taskService = dependencias.taskService
export const deviceRunService = dependencias.deviceRunService
*/
//export const devicesInMemory = InMemoryDeviceStorage.getInstance();
//const inMemoryDeviceManager = new InMemoryDeviceManager(devicesInMemory);

//const deviceDoc = databaseInstance.createDeviceDoc();
//export const deviceService = new MongoDeviceManager(
// inMemoryDeviceManager,
// deviceDoc
//);

//const taskDoc = databaseInstance.createTaskerDoc();
//const mongoTaskManager = new MongoTaskManager(taskDoc);
/*
const appCorn = new AppCron();
const cronTaskManager = new CronTaskManager(mongoTaskManager, appCorn);

export const eventEmitter = new EventEmitter();
const taskManager = new TaskManager(cronTaskManager, eventEmitter);
export const taskService = new TaskService(taskManager, deviceService);

recoveryInMemoryDeviceStorage(deviceService);
fillCronInMemoryWithData();

const deviceRunManager = new DeviceRunManager();
export const deviceRunService = new DeviceRunService(deviceRunManager);
*/
