import { Model, mongo } from "mongoose";
import { Meter } from "../../domain/Meter";
import { DeviceInterface } from "../../application/device/DeviceInterface";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
import { DeviceListingInterface } from "../../application/device/DeviceListingInterface";
import { eventEmitter } from "../../server";
import { DeviceInMemory } from "../../domain/DeviceInMemory";

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
    return this.delegate
      .addDevice(device)
      .catch((err) => Promise.reject(`Device not added due to error: ${err}`))
      .then(() =>
        this.deviceDocument
          .create(device)
          .then((device) => device.id)
          .catch((err) => {
            return this.compensateDeviceAdditionFromMemory(device.id)
              .then(() =>
                Promise.reject()
              )
              .catch(() => {
                if (err instanceof mongo.MongoServerError) {
                  return Promise.reject(
                    `Unique violation error: ${this.uniqueViolationErrorHandler(
                      err
                    )}`
                  );
                }
                return Promise.reject(`Device not added due to error: ${err}`);
              });
          })
      );
    /*
    try {
      const deviceFromDB = await this.deviceDocument.create(device);
      await this.delegate.addDevice(device);

      return Promise.resolve(deviceFromDB.id);
    } catch (err) {
      if (err instanceof mongo.MongoServerError) {
        return Promise.reject(
          `Unique violation error: ${this.uniqueViolationErrorHandler(err)}`
        );
      }
      this.deleteDevice(device.id);

      return Promise.reject(`Device not added to database due error ${err}`);
    }
*/
  }

  private async compensateDeviceAdditionFromMemory(
    deviceId: string
  ): Promise<string> {
    return this.delegate
      .deleteDevice(deviceId)
      .then((device) => Promise.resolve(`Device ${device} deletet from memory`))
      .catch((err) =>
        Promise.reject(`Device not deleted from memory due err: ${err}`)
      );
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("email")) {
      return `EmailConflictError`;
    }
    if (isUniqueViolation && err.errmsg.includes("name")) {
      return "NameConflictError";
    }
    return err;
  }

  async deleteDevice(deviceId: string): Promise<string> {
    const device = DeviceInMemory.getInstance().devices.get(deviceId) as Device;

    return this.delegate
      .deleteDevice(deviceId)
      .catch((err) => Promise.reject(`Deletion failed due error: ${err}`))
      .then(() =>
        this.deviceDocument
          .deleteOne({ id: deviceId })
          .catch((err) =>
            this.compensateDeviceDelationFromMemory(device)
              .then(() => Promise.reject(`Deletion failed due error: ${err}`))
              .catch(() => Promise.reject(`Deletion failed due error: ${err}`))
          )
          .then((dbResult) => {
            console.log("deletion result", dbResult.acknowledged);
            eventEmitter.emit("deviceDeleted", deviceId);
            return Promise.resolve("Success");
          })
      );
  }

  private async compensateDeviceDelationFromMemory(
    device: Device
  ): Promise<string> {
    return this.delegate
      .addDevice(device)
      .then((device) => Promise.resolve(`Deleted ${device} restored`))
      .catch((err) =>
        Promise.reject(`Device not restored in cache due err: ${err}`)
      );
  }

  async getMeterList(): Promise<Meter[]> {
   return this.deviceDocument.find({deviceType: "meter"})
    .then((devices)=> {
      const meters = devices as unknown as Meter[]
      return Promise.resolve(meters)})
    .catch((err) => Promise.reject(`Getting meter list failed due error: ${err}`)) 

/*
    const devicesFromDb = (await this.deviceDocument.find({
      deviceType: "meter",
    })) as Meter[];

    console.log(devicesFromDb);
    return devicesFromDb;
    */
  }

  async getSwitchList(): Promise<Switch[]> {
    return this.deviceDocument.find({deviceType: "switch"})
    .then((devices)=> {
      const switches = devices as unknown as Switch[]
      return Promise.resolve(switches)})
    .catch((err) => Promise.reject(`Getting meter list failed due error: ${err}`)) 
    
  }
}
