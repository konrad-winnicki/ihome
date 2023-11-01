import sanitizedConfig from "../config/config";
import { DeviceRunService } from "./application/device/DeviceRunService";
import { MongoDatabase } from "./Infrastructure/databse/MongoDataBase";
import { AppCron } from "./domain/AppCron";
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
import { TaskService } from "./application/task/TaskService";
import { FileDeviceRepository } from "./Infrastructure/filePersistencia/FileDeviceRepository";
import { FileRepositoryHelpers } from "./Infrastructure/filePersistencia/auxilaryFunctions";
import { FileTaskRepository } from "./Infrastructure/filePersistencia/FileTaskRepository";
import prepareApplicationProperties from "../config/sanitizedProperties";
import { MongoDeviceRepository } from "./Infrastructure/device/MongoDeviceRepository";
import { CacheDeviceRepository } from "./Infrastructure/device/CacheDeviceRepository";
import { DeviceService } from "./application/device/DeviceService";

const ENVIRONMENT = sanitizedConfig.NODE_ENV;

function createMongoDocs(database: MongoDatabase) {
  const deviceDoc = database.createDeviceDoc();
  const taskDoc = database.createTaskerDoc();
  return { deviceDoc, taskDoc };
}

async function choosePersistenciaType(environment: string) {
  if (
    appConfiguration.PERSISTENCIA === "mongoDatabase" ||
    environment === "test_api_database" ||
    environment === "dev_database"
  ) {
    return createDBRepositories();
  }
  if (
    appConfiguration.PERSISTENCIA === "file" ||
    environment === "test_api_file" ||
    environment === "dev_file"
  ) {
    return createFileRepositories();
  }

  throw new Error("Imposible to choose persistencia type");
}

function createFileRepositories() {
  const serverMessages = ServerMessages.getInstance();
  const fileHelperMethods = new FileRepositoryHelpers();
  const deviceRepository = new FileDeviceRepository(
    fileHelperMethods,
    serverMessages
  );

  const taskRepository = new FileTaskRepository(
    fileHelperMethods,
    serverMessages
  );
  return { deviceRepository, taskRepository };
}

async function createDBRepositories() {
  const serverMessages = ServerMessages.getInstance();

  const mongoDatabase = new MongoDatabase(
    appConfiguration.DATABASE_URL,
    appConfiguration.DATABASE
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
  global.appConfiguration = await prepareApplicationProperties();

  const serverMessages = ServerMessages.getInstance();
  const eventEmitter = new EventEmitter();

  const devicesInMemory = InMemoryDeviceStorage.getInstance();
 

  const persistenciaType = await choosePersistenciaType(ENVIRONMENT);

  const cacheDeviceRepository = new CacheDeviceRepository(
    devicesInMemory,
    persistenciaType.deviceRepository,
    serverMessages
  );

  const deviceService = new DeviceService(
    cacheDeviceRepository,
    eventEmitter
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

  //prueba con deviceservice2, ha cambiado dependecia in devceConrollers a deviceService2
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

  const port = Number(appConfiguration.PORT);

  appServer
    .startServer(port)
    .then(() => console.log("App server started"))
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
