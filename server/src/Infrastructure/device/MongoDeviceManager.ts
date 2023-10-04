import { Model, mongo } from "mongoose";
import { Meter } from "../../domain/Meter";
import { DeviceInterface } from "../../application/device/DeviceInterface";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
import { DeviceListingInterface } from "../../application/device/DeviceListingInterface";
//const appCron = new AppCron();

export class MongoDeviceManager implements DeviceInterface, DeviceListingInterface {
  private deviceDocument: Model<Device>;
  delegate: DeviceInterface;

  constructor(
    delegate: DeviceInterface,
    deviceDocument: Model<Device>,
  ) {
    this.deviceDocument = deviceDocument;
    this.delegate = delegate;
  }

  async addDevice(device: Device): Promise<string> {
    await this.delegate.addDevice(device);
    try {
      const taskFromDB = await this.deviceDocument.create(device);
      return taskFromDB.id;
    } catch (err) {
      console.log("ERRRR", err);
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


  async deleteDevice(deviceId:string):Promise<string> {
    await this.delegate.deleteDevice(deviceId)
    try {
      const tasks = await this.deviceDocument.deleteOne({ id: deviceId });
      const result = tasks.acknowledged;
      console.log("deletion result", result);
      if(result){
        return Promise.resolve("Succes")
      }
      return Promise.reject(`Deletion failed`)

      //add reverse delete from devicesInMemory
    } catch (err) {
      console.log(err);
      return Promise.reject(`Deletion failed due error: ${err}`)
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
