import mongoose, { Connection } from "mongoose";
import { DeviceSchema, TaskSchema } from "./mongoDbModel";
import { Task } from "../../domain/Task";
import { Device } from "../../domain/Device";

export class MongoDatabase {
  private url: string;
  private dbName: string;
  public connection: Connection;
  constructor(url: string, dbName: string) {
    this.url = url;
    this.dbName = dbName;
    this.connection = this.connectDatabase();
  }
  connectDatabase() {
    try {
      const options = { dbName: this.dbName };
      const connection = mongoose.createConnection(this.url, options);
      console.log("Connected to the database 🌱");
      return connection;
    } catch (error) {
      console.error("Error connecting to the database:", error);
      throw error;
    }
  }

  public createDeviceDoc() {
    const deviceDocument = this.connection.model<Device>(
      "Device",
      DeviceSchema
    );
    return deviceDocument;
  }

  public createTaskerDoc() {
    const taskDocument = this.connection.model<Task>("Task", TaskSchema);
    return taskDocument;
  }
}
