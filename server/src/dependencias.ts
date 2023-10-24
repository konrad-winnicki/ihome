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
import { TaskRepository } from "./Infrastructure/task/TaskRepositoryN";
import { CronTaskRepository } from "./Infrastructure/task/CronTaskRepositoryN";
import { ServerMessages } from "./ServerMessages";
import { prepareAppProperties } from "./prepareAppProperties";
import { properties } from "./propertyWriter";
function createMongoDocs(database: MongoDatabase) {
  const deviceDoc = database.createDeviceDoc();
  const taskDoc = database.createTaskerDoc();
  return { deviceDoc, taskDoc };
}

export async function initializeDependencias() {

  if (sanitizedConfig.NODE_ENV === 'production'){
    await prepareAppProperties()
  }

  const serverMessages = new ServerMessages();
  const eventEmitter = new EventEmitter();

  const devicesInMemory = InMemoryDeviceStorage.getInstance();
  const inMemoryDeviceManager = new InMemoryDeviceManager(
    devicesInMemory,
    serverMessages
  );




  async function prepareDatabasePersistencia(inMemoryDeviceManager:InMemoryDeviceManager){
    let DATABASE_URL = "";
    let DATABASE = "";

    if(properties.get('persistencia') === "mongoDatabase"){
      DATABASE_URL = (properties.get('DATABASE_URL')) as string
      DATABASE = (properties.get('DATABASE')) as string
    }else{
      DATABASE_URL = sanitizedConfig.MONGO_URI
      DATABASE = sanitizedConfig.DATABASE
    }

    const mongoDatabase = new MongoDatabase(
      DATABASE_URL,
      DATABASE
    );

    const mongoDocs = createMongoDocs(mongoDatabase);
    const deviceService = new MongoDeviceManager(
      inMemoryDeviceManager,
      mongoDocs.deviceDoc,
      eventEmitter,
      serverMessages
    );
  
    const mongoTaskManager = new MongoTaskManager(
      mongoDocs.taskDoc,
      serverMessages
    );
  
    const taskRepository = new TaskRepository(mongoDocs.taskDoc);
  
    return {deviceService, mongoTaskManager, taskRepository, mongoDatabase}
  }
  



const persistencia = await prepareDatabasePersistencia(inMemoryDeviceManager)
  


  
  const appCorn = new AppCron();
  const cronTaskManager = new CronTaskManager(
    persistencia.mongoTaskManager,
    persistencia.taskRepository,
    appCorn,
    serverMessages
  );

  const taskManager = new TaskManager(
    cronTaskManager,
    persistencia.taskRepository,
    eventEmitter
  );
  const taskService = new TaskService(
    taskManager,
    persistencia.taskRepository,
    persistencia.deviceService
  );

  const deviceRunManager = new DeviceRunManager();
  const deviceRunService = new DeviceRunService(deviceRunManager);

  const deviceRunControllerDep = new RunDeviceControllers(
    deviceRunService,
    devicesInMemory
  );
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

  await recoveryInMemoryDeviceStorage(persistencia.deviceService, devicesInMemory);

  const cronTaskRepository = new CronTaskRepository(persistencia.taskRepository, appCorn);
  await fillCronInMemoryWithData(cronTaskRepository);


  const port = sanitizedConfig.NODE_ENV==='prodction'? Number(properties.get('PORT')): sanitizedConfig.PORT
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


const device1 = {id:"15", name: "ccc", type: 'type'}
const device2 = {id:"14", name: "c", type: 'type'}

//addDeviceToFile(device1).then((res)=>console.log(res)).catch((err)=> console.log(err))
//addDeviceToFile(device2).then((res)=>console.log(res)).catch((err)=> console.log(err))

//deleteDeviceFromFile('14').then((res)=>console.log(res)).catch((err)=> console.log(err))
