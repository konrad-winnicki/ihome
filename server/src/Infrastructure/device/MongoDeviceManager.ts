import { Model, mongo } from "mongoose";
import { Meter } from "../../domain/Meter";
import { DeviceInterface } from "../../application/device/DeviceInterface";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
import { DeviceListingInterface } from "../../application/device/DeviceListingInterface";
import { eventEmitter } from "../../server";

//const appCron = new AppCron();

export class MongoDeviceManager
  implements DeviceInterface, DeviceListingInterface
{
  private deviceDocument: Model<Device>;
  delegate: DeviceInterface;

  constructor(delegate: DeviceInterface, deviceDocument: Model<Device>) {
    this.deviceDocument = deviceDocument;
    this.delegate = delegate;
  }

  async addDevice(device: Device): Promise<string> {
    try {
      const deviceFromDB = await this.deviceDocument.create(device);
      await this.delegate.addDevice(device);

      return Promise.resolve(deviceFromDB.id);
    } catch (err) {
      if (err instanceof mongo.MongoServerError) {
        return Promise.reject(
          `Unique violation error ${this.uniqueViolationErrorHandler(err)}`
        );
      }
      this.deleteDevice(device.id);

      return Promise.reject(`Device not added to database due error ${err}`);
    }
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("email")) {
      //throw new Error("EmailConflictError");
      return `EmailConflictError`;
    }
    if (isUniqueViolation && err.errmsg.includes("name")) {
      //throw new Error("NameConflictError");
      return "NameConflictError";
    }
    return err;
  }

  async deleteDevice(deviceId: string): Promise<string> {
    try {
      await this.delegate.deleteDevice(deviceId);
      const tasks = await this.deviceDocument.deleteOne({ id: deviceId });
      const result = tasks.acknowledged;
      console.log("deletion result", result);

      eventEmitter.emit("deviceDeleted", deviceId);
      return Promise.resolve("Succes");
    } catch (err) {
      if (typeof err === "string" && err.includes("MemoryError")) {
        return Promise.reject(`Deletion failed due error: ${err}`);
      }

      try {
        const device = await this.deviceDocument.findOne({ id: deviceId });
        if (!device) {
          return Promise.reject(
            `Device not found in data base to restore device in cache`
          );
        }
        this.delegate.addDevice(device);
      } catch (err) {
        return Promise.reject(`Device not restored in cache due err: ${err}`);
      }

      return Promise.reject(`Deletion failed due error: ${err}`);
    }
  }

  async getMeterList(): Promise<Meter[]> {
    const devicesFromDb = (await this.deviceDocument.find({
      deviceType: "meter",
    })) as Meter[];

    console.log(devicesFromDb);
    return devicesFromDb;
  }

  async getSwitchList(): Promise<Switch[]> {
    const devicesFromDb = (await this.deviceDocument.find({
      deviceType: "switch",
    })) as Switch[];

    console.log(devicesFromDb);
    return devicesFromDb;
  }
}

/*
class EventListener {
  constructor() {
    eventEmitter.on('deviceDeleted', this.handleEvent);
  }

  handleEvent(msg:string) {
    console.log(`Event received with data: ${msg}`);
  }
}

const listenet = new EventListener
*/
