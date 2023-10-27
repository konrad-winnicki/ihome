import sanitizedConfig from "../config/config";
import { DeviceRunService } from "./application/device/DeviceRunService";
import { MongoDatabase } from "./Infrastructure/databse/MongoDataBase";
import { AppCron } from "./domain/AppCron";
import { DeviceService } from "./application/device/DeviceService";
import { CacheDeviceRepository } from "./Infrastructure/device/CacheDeviceRepository";
import { EventEmitter } from "node:events";
import { CronTaskManager } from "./Infrastructure/task/CronTaskManager";
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
import { MongoTaskRepository } from "./Infrastructure/task/MongoTaskRepository";
import { TaskRecoveryManager } from "./Infrastructure/task/TaskRecoveryManager";
import { ServerMessages } from "./ServerMessages";
import { prepareAppProperties } from "./prepareAppProperties";
import { MongoDeviceRepository } from "./Infrastructure/device/MongoDeviceRepository";
import { TaskService } from "./application/task/TaskService";
import { properties } from "./propertyWriter";
import { FileDeviceRepository } from "./Infrastructure/filePersistencia/FileDeviceRepository";
import { FileRepositoryHelpers } from "./Infrastructure/filePersistencia/auxilaryFunctions";
function createMongoDocs(database: MongoDatabase) {
  const deviceDoc = database.createDeviceDoc();
  const taskDoc = database.createTaskerDoc();
  return { deviceDoc, taskDoc };
}

export async function initializeDependencias() {
  if (sanitizedConfig.NODE_ENV === "production") {
    await prepareAppProperties();
  }

  const serverMessages = new ServerMessages();
  const eventEmitter = new EventEmitter();

  const devicesInMemory = InMemoryDeviceStorage.getInstance();
  const cacheDeviceRepository = new CacheDeviceRepository(
    devicesInMemory,
    serverMessages
  );

  async function prepareDatabasePersistencia(
    cacheDeviceRepository: CacheDeviceRepository
  ) {
    let DATABASE_URL = "";
    let DATABASE = "";

    if (sanitizedConfig.NODE_ENV === "production") {
      if (properties.get("persistencia") === "mongoDatabase") {
        DATABASE_URL = properties.get("DATABASE_URL") as string;
        DATABASE = properties.get("DATABASE") as string;
      }
    } else {
      DATABASE_URL = sanitizedConfig.MONGO_URI;
      DATABASE = sanitizedConfig.DATABASE;
    }

    //function createDeviceDBRepository(){}

    const mongoDatabase = new MongoDatabase(DATABASE_URL, DATABASE);
    const mongoDocs = createMongoDocs(mongoDatabase);

    const mongoDeviceRepository = new MongoDeviceRepository(
      mongoDocs.deviceDoc,
      serverMessages
    );

    const fileHelperMethods = new FileRepositoryHelpers
    const fileDeviceRepository = new FileDeviceRepository(fileHelperMethods, serverMessages)
    
    const deviceService = new DeviceService(
      cacheDeviceRepository,
      fileDeviceRepository,
      eventEmitter,
      serverMessages
    );

    const taskRepository = new MongoTaskRepository(
      mongoDocs.taskDoc,
      serverMessages
    );

    return { deviceService, taskRepository, mongoDatabase };
  }

  const persistencia = await prepareDatabasePersistencia(cacheDeviceRepository);

  const appCorn = new AppCron();
  const cronTaskManager = new CronTaskManager(appCorn, serverMessages);

  const taskService = new TaskService(
    persistencia.taskRepository,
    cronTaskManager,
    persistencia.deviceService,
    serverMessages,
    eventEmitter
  );

  const deviceRunService = new DeviceRunService(cacheDeviceRepository);

  const deviceRunControllerDep = new RunDeviceControllers(deviceRunService);

  const deviceControllers = new DeviceControllers(persistencia.deviceService);
  const taskControlles = new TaskControllers(taskService);
  const loginControllers = new LoginControllers(tokenGenerator);

  const appRouter = initAppRouter(
    deviceControllers,
    deviceRunControllerDep,
    taskControlles,
    loginControllers
  );

  const appServer = new AppServer(appRouter);

  await recoveryInMemoryDeviceStorage(
    persistencia.deviceService,
    devicesInMemory
  );

  const cronTaskRepository = new TaskRecoveryManager(
    persistencia.taskRepository,
    cronTaskManager
  );
  await fillCronInMemoryWithData(cronTaskRepository);

  const port =
    sanitizedConfig.NODE_ENV === "prodction"
      ? Number(properties.get("PORT"))
      : sanitizedConfig.PORT;
  appServer
    .startServer(port)
    .then(() => console.log("server listen succes"))
    .catch((err) => console.log("error", err));

  return Application.getInstance(
    appServer,
    persistencia.mongoDatabase,
    devicesInMemory,
    serverMessages
  );
}

export class Application {
  private static instance: Application | null = null;
  public appServer: AppServer;
  public databaseInstance: MongoDatabase;
  public devicesInMemory: InMemoryDeviceStorage;
  public serverMessages: ServerMessages;

  constructor(
    appServer: AppServer,
    databaseInstance: MongoDatabase,
    devicesInMemory: InMemoryDeviceStorage,
    serverMessages: ServerMessages
  ) {
    this.appServer = appServer;
    this.databaseInstance = databaseInstance;
    this.devicesInMemory = devicesInMemory;
    this.serverMessages = serverMessages;
  }

  public static getInstance(
    appServer: AppServer,
    databaseInstance: MongoDatabase,
    devicesInMemory: InMemoryDeviceStorage,
    serverMessages: ServerMessages
  ) {
    if (!Application.instance) {
      Application.instance = new Application(
        appServer,
        databaseInstance,
        devicesInMemory,
        serverMessages
      );
    }
    return Application.instance;
  }
}

const COMPENSATION = {
  SUCCESS: "Compensation succeded",
  FAILURE: "Compensation failed",
} as const;

type ObjectValues<T> = T[keyof T];

type OptionsFlags<T> = {
  [K in keyof T]: T[K];
};

type Compensation = ObjectValues<typeof COMPENSATION>;

const device1 = { id: "15", name: "ccc", type: "type" };
const device2 = { id: "14", name: "c", type: "type" };

//addDeviceToFile(device1).then((res)=>console.log(res)).catch((err)=> console.log(err))
//addDeviceToFile(device2).then((res)=>console.log(res)).catch((err)=> console.log(err))

//deleteDeviceFromFile('14').then((res)=>console.log(res)).catch((err)=> console.log(err))
