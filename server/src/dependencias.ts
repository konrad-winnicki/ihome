import { DeviceRunService } from "./application/device/DeviceRunService";
import { MongoDatabase } from "./Infrastructure/database/MongoDataBase";
import { TaskScheduler } from "./Infrastructure/task/TaskScheduler";
import { EventEmitter } from "node:events";
import { recoverTasks } from "./domain/recoveryFunctions";
import { AppServer } from "./Infrastructure/AppServer";
import { initAppRouter } from "./Infrastructure/routes";
import { CachedDevice } from "./domain/CachedDevices";
import { DeviceController } from "./controllers/DeviceController";
import { RunDeviceController } from "./controllers/DeviceRunController";
import { TaskController } from "./controllers/TaskController";
import { LoginController } from "./controllers/LoginController";
import { tokenGenerator } from "./domain/tokenGenerator";
import { TaskRecoveryManager } from "./Infrastructure/task/TaskRecoveryManager";
import { ServerMessages } from "./ServerMessages";
import { FileDeviceRepository } from "./Infrastructure/filePersistencia/FileDeviceRepository";
import { FileRepositoryHelpers } from "./Infrastructure/filePersistencia/auxilaryFunctions";
import prepareApplicationProperties from "../config/sanitizedProperties";
import { MongoDeviceRepository } from "./Infrastructure/databasePersistencia/MongoDeviceRepository";
import { CacheDeviceRepository } from "./Infrastructure/databasePersistencia/CacheDeviceRepository";
import { DeviceService } from "./application/device/DeviceService";
import { CronTaskManager } from "./Infrastructure/task/CronTaskManager";
import { FileTaskRepository } from "./Infrastructure/filePersistencia/FileTaskRepository";
import { MongoTaskRepository } from "./Infrastructure/task/MongoTaskRepository";
import { TaskService } from "./application/task/TaskService";
import { CommandExecutor } from "./Infrastructure/command/CommandExecutor";
import { getEnvironmentType } from "../config/config";
import { DATABASE_CONFIGURATION } from "../config/sanitizedProperties";

const ENVIRONMENT = getEnvironmentType();

function createMongoDocs(database: MongoDatabase) {
  const deviceDoc = database.createDeviceDoc();
  const taskDoc = database.createTaskerDoc();
  return { deviceDoc, taskDoc };
}

async function createRepositories() {
  function throwUnknownPersistenceType(unknownType: never): never {
    throw new Error("Unknown persistence type: " + unknownType);
  }

  switch (appConfiguration.PERSISTENCIA) {
    case "DATABASE":
      return createDBRepositories(appConfiguration as DATABASE_CONFIGURATION);
    case "FILE":
      return createFileRepositories();
    default:
      return throwUnknownPersistenceType(appConfiguration.PERSISTENCIA);
  }
}

async function chooseServerType(
  environment: string,
  appServer: AppServer,
  port: number
) {
  if (appConfiguration.SERVER_TYPE === "https") {
    return appServer
      .startHttpsServer(port)
      .then(() => console.log("Https server started"))
      .catch((err) => console.log("Error during starting https server:", err));
  }
  if (
    appConfiguration.SERVER_TYPE === "http" ||
    environment.includes("test_api_") ||
    environment.includes("dev_")
  ) {
    return appServer
      .startHttpServer(port)
      .then(() => console.log("Http server started"))
      .catch((err) => console.log("Error during starting http server:", err));
  }

  throw new Error("Imposible to choose server type");
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

async function createDBRepositories(config: DATABASE_CONFIGURATION) {
  const serverMessages = ServerMessages.getInstance();

  const mongoDatabase = new MongoDatabase(config.DATABASE_URL, config.DATABASE);

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

  const devicesInMemory = CachedDevice.getInstance();

  const repositories = await createRepositories();
  const deviceRunService = new DeviceRunService(devicesInMemory);

  const cacheDeviceRepository = new CacheDeviceRepository(
    devicesInMemory,
    repositories.deviceRepository,
    serverMessages
  );

  const deviceService = new DeviceService(cacheDeviceRepository, eventEmitter);

  const appCorn = new TaskScheduler(deviceRunService);
  const cronTaskManager = new CronTaskManager(
    appCorn,
    repositories.taskRepository,
    serverMessages
  );

  const taskService = new TaskService(
    cronTaskManager,
    deviceService,
    eventEmitter
  );

  const deviceRunControllerDep = new RunDeviceController(deviceRunService);

  const deviceControllers = new DeviceController(deviceService);
  const taskControlles = new TaskController(taskService);
  const loginControllers = new LoginController(tokenGenerator);

  const appRouter = initAppRouter(
    deviceControllers,
    deviceRunControllerDep,
    taskControlles,
    loginControllers
  );

  const appServer = new AppServer(appRouter);

  const cronTaskRepository = new TaskRecoveryManager(
    repositories.taskRepository,
    appCorn
  );

  await switchOffAllDevicesAfterServerStart(deviceService)
    .then((result) => console.log("Switched off all devices:", result))
    .catch((error) => console.log(error));

  await recoverTasks(cronTaskRepository);

  const port = appConfiguration.PORT;

  await chooseServerType(ENVIRONMENT, appServer, port);

  if ("mongoDatabase" in repositories) {
    return Application.getInstance(
      appServer,
      devicesInMemory,
      serverMessages,
      repositories.mongoDatabase
    );
  } else {
    return Application.getInstance(appServer, devicesInMemory, serverMessages);
  }
}

export class Application {
  private static instance: Application | null = null;
  public appServer: AppServer;
  public devicesInMemory: CachedDevice;
  public serverMessages: ServerMessages;
  public databaseInstance?: MongoDatabase;

  constructor(
    appServer: AppServer,
    devicesInMemory: CachedDevice,
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
    devicesInMemory: CachedDevice,
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

async function switchOffAllDevicesAfterServerStart(
  deviceService: DeviceService
) {
  const devices = await deviceService.getSwitchList();
  const switchPerformer = CommandExecutor.getInstance();
  const switchingResults = [];
  for (const device of devices) {
    const result = await switchPerformer
      .switchOff(device)
      .then(() => {
        return Promise.resolve({
          [device.id]: "Item switched off during server restart",
        });
      })
      .catch(() => {
        const message = {
          [`Switch ${device.id}`]:
            "Error occured during switching off after server restart",
        };
        return Promise.resolve(message);
      });

    switchingResults.push(result);
  }

  return switchingResults;
}
