import { Model, mongo } from "mongoose";
import { DeviceMapManager } from "../../domain/DeviceMapManager";
import { Meter } from "../../domain/Meter";
import { DeviceInterface } from "../../application/device/DeviceInterface";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
//const appCron = new AppCron();

export class DeviceManager implements DeviceInterface {
  private deviceDocument: Model<Device>;
  private deviceMap: DeviceMapManager;
  constructor(
    deviceDocument: Model<Device>,
    deviceMap: DeviceMapManager
  ) {
    this.deviceDocument = deviceDocument;
    this.deviceMap = deviceMap;
  }

  addDeviceToLocalStorage(device: Device): boolean {
    try {
      this.deviceMap.addDevice(device);

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  async addDeviceToDB(device: Device): Promise<string> {
    try {
      const taskFromDB = await this.deviceDocument.create(device);
      if (taskFromDB) {
        try {
          this.addDeviceToLocalStorage(device);
          const device1 = this.deviceMap.devices.get(taskFromDB.id);
          console.log("DEVICE", device1);
        } catch (err) {
          this.deviceDocument.findByIdAndRemove(taskFromDB.id);
          throw err;
        }
      }
      return device.id;
    } catch (err) {
      if (err instanceof mongo.MongoServerError) {
        this.uniqueViolationErrorHandler(err);
      }
      throw err;
    }
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("email")) {
      throw new Error("EmailConflictError");
    }
    if (isUniqueViolation && err.errmsg.includes("name")) {
      throw new Error("NameConflictError");
    }
    throw err;
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
