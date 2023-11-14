import sanitizedConfig from "../config/config";
import { DeviceRunService } from "./application/device/DeviceRunService";
import { MongoDatabase } from "./Infrastructure/databse/MongoDataBase";
import { TaskScheduler } from "./domain/TaskScheduler";
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
import { MongoDeviceRepository } from "./Infrastructure/device/MongoDeviceRepository";
import { CacheDeviceRepository } from "./Infrastructure/device/CacheDeviceRepository";
import { DeviceService } from "./application/device/DeviceService";
import { CronTaskManager } from "./Infrastructure/task/CronTaskManager";
import { FileTaskRepository } from "./Infrastructure/filePersistencia/FileTaskRepository";
import { MongoTaskRepository } from "./Infrastructure/task/MongoTaskRepository";
import { TaskService } from "./application/task/TaskService";
import { DevicePerformer } from "./domain/DevicePerformer";

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

  const devicesInMemory = CachedDevice.getInstance();

  const persistenciaType = await choosePersistenciaType(ENVIRONMENT);
  const deviceRunService = new DeviceRunService(devicesInMemory);

  const cacheDeviceRepository = new CacheDeviceRepository(
    devicesInMemory,
    persistenciaType.deviceRepository,
    serverMessages
  );

  const deviceService = new DeviceService(cacheDeviceRepository, eventEmitter);

  const appCorn = new TaskScheduler(deviceRunService);
  const cronTaskManager = new CronTaskManager(
    appCorn,
    persistenciaType.taskRepository,
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
    persistenciaType.taskRepository,
    appCorn
  );

  await switchOffAllDevicesAfterServerStart(deviceService)
    .then((result) => console.log(result))
    .catch((error) => console.log(error));

  await recoverTasks(cronTaskRepository);

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
  const switchPerformer = DevicePerformer.getInstance();
  const switchingResults = [];
  for (const device of devices) {
    const result = await switchPerformer
      .switchOn(device)
      .then(() => {
        return Promise.resolve({
          [device.id]: "Item switched off during server restart",
        });
      })
      .catch(() => {
        const message = {
          [`Switch ${device.id}`]:
            "Error occureed during switching off after server restart",
        };
        return Promise.resolve(message);
      });

    switchingResults.push(result);
  }

  return switchingResults;
}
