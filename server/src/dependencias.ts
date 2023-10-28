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
import { FileDeviceRepository } from "./Infrastructure/filePersistencia/FileDeviceRepository";
import { FileRepositoryHelpers } from "./Infrastructure/filePersistencia/auxilaryFunctions";
import PropertiesReader from "properties-reader";
import { readPropertyFile } from "./propertyWriter";

function createMongoDocs(database: MongoDatabase) {
  const deviceDoc = database.createDeviceDoc();
  const taskDoc = database.createTaskerDoc();
  return { deviceDoc, taskDoc };
}

function prepareDatabaseUrlAndName(
  environment: string,
  properties: PropertiesReader.Reader
) {
  let databaseUrl = "";
  let database = "";

  if (environment === "production") {
    if (properties.get("PERSISTENCIA") === "mongoDatabase") {
      databaseUrl = properties.get("DATABASE_URL") as string;
      database = properties.get("DATABASE") as string;
    }
  } else {
    databaseUrl = sanitizedConfig.MONGO_URI;
    database = sanitizedConfig.DATABASE;
  }

  return { databaseUrl, database };
}

async function choosePersistenciaType(
  environment: string,
  properties: PropertiesReader.Reader
) {
  console.log("choose persistencia", properties.get("PERSISTENCIA"));

  if (
    properties.get("PERSISTENCIA") === "mongoDatabase" ||
    environment === "test_api_database" ||
    environment === "dev_database"
  ) {
    return createDBRepositories(environment, properties);
  }
  if (
    properties.get("PERSISTENCIA") === "file" ||
    environment === "test_api_file" ||
    environment === "dev_file"
  ) {
    return createFileRepositories(environment, properties);
  }

  throw new Error("Imposible to choose persistencia type");
}

function createFileRepositories(
  environment: string,
  properties: PropertiesReader.Reader
) {
  const serverMessages = ServerMessages.getInstance();
  const fileHelperMethods = new FileRepositoryHelpers();
  const deviceRepository = new FileDeviceRepository(
    fileHelperMethods,
    serverMessages
  );

  const a = createDBRepositories(environment, properties);
  const taskRepository = a.taskRepository;
  return { deviceRepository, taskRepository };
}

function createDBRepositories(
  environment: string,
  properties: PropertiesReader.Reader
) {
  const serverMessages = ServerMessages.getInstance();
  const databaseData = prepareDatabaseUrlAndName(environment, properties);

  const mongoDatabase = new MongoDatabase(
    databaseData.databaseUrl,
    databaseData.database
  );
  const mongoDocs = createMongoDocs(mongoDatabase);

  const deviceRepository = new MongoDeviceRepository(
    mongoDocs.deviceDoc,
    serverMessages
  );
  const taskRepository = new MongoTaskRepository(
    mongoDocs.taskDoc,
    serverMessages
  );

  return { deviceRepository, taskRepository, mongoDatabase };
}

export async function initializeDependencias() {
  const environment = sanitizedConfig.NODE_ENV;

  const propertiesPath = readPropertyFile(environment);
  const properties = PropertiesReader(propertiesPath, undefined, {
    writer: { saveSections: true },
  });

  if (environment === "production") {
    await prepareAppProperties(properties, propertiesPath);
    console.log("if", properties.get("PERSISTENCIA"));
  }

  const serverMessages = ServerMessages.getInstance();
  const eventEmitter = new EventEmitter();

  const devicesInMemory = InMemoryDeviceStorage.getInstance();
  const cacheDeviceRepository = new CacheDeviceRepository(
    devicesInMemory,
    serverMessages
  );

  const persistenciaType = await choosePersistenciaType(
    environment,
    properties
  );

  const deviceService = new DeviceService(
    cacheDeviceRepository,
    persistenciaType.deviceRepository,
    eventEmitter,
    serverMessages
  );

  const appCorn = new AppCron();
  const cronTaskManager = new CronTaskManager(appCorn, serverMessages);

  const taskService = new TaskService(
    persistenciaType.taskRepository,
    cronTaskManager,
    deviceService,
    serverMessages,
    eventEmitter
  );

  const deviceRunService = new DeviceRunService(cacheDeviceRepository);

  const deviceRunControllerDep = new RunDeviceControllers(deviceRunService);

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

  const cronTaskRepository = new TaskRecoveryManager(
    persistenciaType.taskRepository,
    cronTaskManager
  );
  await fillCronInMemoryWithData(cronTaskRepository);

  const port = Number(properties.get("PORT"));

  appServer
    .startServer(port)
    .then(() => console.log("server listen succes"))
    .catch((err) => console.log("error", err));

  if ("mongoDatabase" in persistenciaType) {
    return Application.getInstance(
      appServer,
      devicesInMemory,
      serverMessages,
      persistenciaType.mongoDatabase
    );
  } else {
    return Application.getInstance(appServer, devicesInMemory, serverMessages);
  }
}

export class Application {
  private static instance: Application | null = null;
  public appServer: AppServer;
  public devicesInMemory: InMemoryDeviceStorage;
  public serverMessages: ServerMessages;
  public databaseInstance?: MongoDatabase;

  constructor(
    appServer: AppServer,
    devicesInMemory: InMemoryDeviceStorage,
    serverMessages: ServerMessages,
    databaseInstance?: MongoDatabase
  ) {
    this.appServer = appServer;
    this.databaseInstance = databaseInstance;
    this.serverMessages = serverMessages;
    this.devicesInMemory = devicesInMemory;
  }

  public static getInstance(
    appServer: AppServer,
    devicesInMemory: InMemoryDeviceStorage,
    serverMessages: ServerMessages,
    databaseInstance?: MongoDatabase
  ) {
    if (!Application.instance) {
      Application.instance = new Application(
        appServer,
        devicesInMemory,
        serverMessages,
        databaseInstance
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
