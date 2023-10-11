import sanitizedConfig from "../config/config";
import { TaskService } from "./application/task/TaskService";
import { TaskManager } from "./Infrastructure/task/TaskManager";
import { DeviceInMemory } from "./domain/DeviceInMemory";
import { DeviceRunManager } from "./Infrastructure/device/DeviceRunManager";
import { DeviceRunService } from "./application/device/DeviceRunService";
import { MongoDatabase } from "./Infrastructure/databse/MongoDataBase";
import { AppCron } from "./domain/AppCron";
import { MongoDeviceManager } from "./Infrastructure/device/MongoDeviceManager";
import { InMemoryDeviceManager } from "./Infrastructure/device/InMemoryDeviceManager";
import { EventEmitter } from "node:events";
import { CronTaskManager } from "./Infrastructure/task/CronTaskManager";
import { MongoTaskManager } from "./Infrastructure/task/MongoTaskManager";
import { fillDeviceInMemoryWithData, fillCronInMemoryWithData } from "./domain/inMemoryRecoveryFunctions";


export const database = new MongoDatabase(
  sanitizedConfig.MONGO_URI,
  sanitizedConfig.DATABASE
);


export const devicesInMemory = DeviceInMemory.getInstance();
const inMemoryDeviceManager = new InMemoryDeviceManager(devicesInMemory);

const deviceDoc = database.createDeviceDoc();
export const deviceService = new MongoDeviceManager(
  inMemoryDeviceManager,
  deviceDoc
);


const taskDoc = database.createTaskerDoc();
const mongoTaskManager = new MongoTaskManager(taskDoc);

const appCorn = new AppCron();
const cronTaskManager = new CronTaskManager(mongoTaskManager, appCorn);

export const eventEmitter = new EventEmitter();
const taskManager = new TaskManager(cronTaskManager, eventEmitter);
export const taskService = new TaskService(taskManager);


fillDeviceInMemoryWithData()
fillCronInMemoryWithData();

const deviceRunManager = new DeviceRunManager();
export const deviceRunService = new DeviceRunService(deviceRunManager);


