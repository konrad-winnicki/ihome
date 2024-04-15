import { MongoDatabase } from "../infrastructure/database/MongoDatabase";

export function createAllMongoDocs(database: MongoDatabase) {
  const deviceDoc = database.createDeviceDoc();
  const taskDoc = database.createTaskDoc();
  return { deviceDoc, taskDoc };
}
