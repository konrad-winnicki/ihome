import { MongoDatabase } from "../infrastructure/database/MongoDatabase";
import { AppServer } from "../infrastructure/AppServer";
import { CachedDevice } from "../infrastructure/cache/CachedDevices";
import { ServerMessages } from "../ServerMessages";

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
