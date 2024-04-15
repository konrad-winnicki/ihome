import { DeviceRunService } from "./application/device/DeviceRunService";
import { TaskScheduler } from "./Infrastructure/cache/TaskScheduler";
import { EventEmitter } from "node:events";
import { recoverTasks } from "./domain/recoveryFunctions";
import { AppServer } from "./Infrastructure/AppServer";
import { initAppRouter } from "./Infrastructure/routes";
import { CachedDevice } from "./Infrastructure/cache/CachedDevices";
import { DeviceController } from "./controllers/DeviceController";
import { RunDeviceController } from "./controllers/DeviceRunController";
import { TaskController } from "./controllers/TaskController";
import { LoginController } from "./controllers/LoginController";
import { tokenGenerator } from "./domain/tokenGenerator";
import { TaskRecoveryManager } from "./Infrastructure/database/TaskRecoveryManager";
import { ServerMessages } from "./ServerMessages";
import prepareApplicationProperties from "../config/sanitizedProperties";
import { CacheDeviceRepository } from "./application/device/CacheDeviceRepository";
import { DeviceService } from "./application/device/DeviceService";
import { CronTaskManager } from "./application/task/CronTaskManager";
import { TaskService } from "./application/task/TaskService";
import { getNodeEnvType } from "../config/config";
import { chooseServerType } from "./dependencies/chooseServerType";
import { chooseRepositoryType } from "./dependencies/chooseRepositoryType";
import { Application } from "./dependencies/Application";
import { switchOffAllDevicesAfterServerStart } from "./dependencies/switchOffAllDevicesAfterServerStart";

const ENVIRONMENT = getNodeEnvType();

export async function initializeApplication() {
  global.appConfiguration = await prepareApplicationProperties();
  const PORT = appConfiguration.PORT;

  const serverMessages = ServerMessages.getInstance();
  const eventEmitter = new EventEmitter();

  const devicesInMemory = CachedDevice.getInstance();

  const repositories = await chooseRepositoryType();
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

  const deviceRunController = new RunDeviceController(deviceRunService);

  const deviceControllers = new DeviceController(deviceService);
  const taskControlles = new TaskController(taskService);
  const loginControllers = new LoginController(tokenGenerator);

  const appRouter = initAppRouter(
    deviceControllers,
    deviceRunController,
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

  await chooseServerType(ENVIRONMENT, appServer, PORT);

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
