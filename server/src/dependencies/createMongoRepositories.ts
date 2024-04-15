import { MongoDatabase } from "../infrastructure/database/MongoDatabase";
import { ServerMessages } from "../ServerMessages";
import { MongoDeviceRepository } from "../infrastructure/database/MongoDeviceRepository";
import { MongoTaskRepository } from "../infrastructure/database/MongoTaskRepository";
import { DATABASE_CONFIGURATION } from "../../config/sanitizedProperties";
import { createAllMongoDocs } from "./createAllMongoDocs";

export async function createMongoRepositories(config: DATABASE_CONFIGURATION) {
  const serverMessages = ServerMessages.getInstance();
  const mongoDatabase = new MongoDatabase(config.DATABASE_URL, config.DATABASE);
  const mongoDocs = createAllMongoDocs(mongoDatabase);

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
