import { Model, mongo } from "mongoose";
import { Meter } from "../../domain/Meter";
import { DeviceInterface } from "../../application/device/DeviceInterface";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
import { DeviceListingInterface } from "../../application/device/DeviceListingInterface";
import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { EventEmitter } from "node:events";

export class MongoDeviceManager
  implements DeviceInterface, DeviceListingInterface
{
  private deviceDocument: Model<Device>;
  private eventEmitter: EventEmitter;
  delegate: DeviceInterface;

  constructor(
    delegate: DeviceInterface,
    deviceDocument: Model<Device>,
    eventEmitter: EventEmitter
  ) {
    this.deviceDocument = deviceDocument;
    this.delegate = delegate;
    this.eventEmitter = eventEmitter;
  }

  async addDevice(device: Device): Promise<string> {
    return this.delegate
      .addDevice(device)
      .catch((err) => Promise.reject(`Device not added due to error: ${err}`))
      .then(() =>
        this.deviceDocument
          .create(device)
          .then((device) => {
            return device.id;
          })
          .catch((dbError) => {
            return this.compensateDeviceAdditionFromMemory(device.id).then(
              () => {
                console.log("Add device compensation succeeded.");
                return Promise.reject(dbError);
              }
            );
          })
          .catch((dbError) => {
            return this.translateDbError(dbError);
          })
      );
  }

  private translateDbError(dbError: Error) {
    return dbError instanceof mongo.MongoServerError
      ? Promise.reject(
          `Device not added due error: MongoServerError: ${this.uniqueViolationErrorHandler(
            dbError
          )}`
        )
      : Promise.reject(`Device not added due to error: ${dbError}`);
  }

  private async compensateDeviceAdditionFromMemory(
    deviceId: string
  ): Promise<string> {
    return this.delegate
      .deleteDevice(deviceId)
      .then((device) => Promise.resolve(`Device ${device} deleted from memory`))
      .catch((err) => {
        console.log("Adding device compensation failed.");
        return Promise.reject(
          `Compensation failed. Device not deleted from memory due err: ${err}`
        );
      });
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("name")) {
      return "Unique violation error: NameConflictError";
    }
    return err;
  }

  async deleteDevice(deviceId: string): Promise<string> {
    const device = InMemoryDeviceStorage.getInstance().devices.get(
      deviceId
    ) as Device;

    return this.delegate
      .deleteDevice(deviceId)
      .catch((err) => Promise.reject(`Deletion failed due error: ${err}`))
      .then(() =>
        this.deviceDocument
          .deleteOne({ id: deviceId })
          .catch(() =>
            this.compensateDeviceDelationFromMemory(device)
              .then((err) =>
                Promise.reject(`Deletion failed due error: ${err}`)
              )
              .catch((err) =>
                Promise.reject(`Deletion failed due error: ${err}`)
              )
          )
          .then((dbResult) => {
            console.log("deletion result", dbResult);
            this.eventEmitter.emit("deviceDeleted", deviceId);
            return Promise.resolve("Device deleted succesfully.");
          })
      );
  }

  private async compensateDeviceDelationFromMemory(
    device: Device
  ): Promise<string> {
    return this.delegate
      .addDevice(device)
      .then((deviceId) => {
        console.log("Delete device compensation succeeded");
        return Promise.resolve(
          `Delete device compensation succeeded. Deleted ${deviceId} restored`
        );
      })
      .catch((err) => {
        console.log("Delete device compensation failed.");
        return Promise.reject(
          `Delete compensation failed: Device not restored in cache due err: ${err}`
        );
      });
  }

  async getMeterList(): Promise<Meter[]> {
    return this.deviceDocument
      .find({ deviceType: "meter" })
      .then((devices) => {
        const meters = devices as unknown as Meter[];
        return Promise.resolve(meters);
      })
      .catch((err) =>
        Promise.reject(`Getting meter list failed due error: ${err}`)
      );
  }

  async getSwitchList(): Promise<Switch[]> {
    return this.deviceDocument
      .find({ deviceType: "switch" })
      .then((devices) => {
        const switches = devices as unknown as Switch[];
        return Promise.resolve(switches);
      })
      .catch((err) =>
        Promise.reject(`Getting meter list failed due error: ${err}`)
      );
  }

  getDeviceById(deviceId: string): Promise<boolean> {
    return this.deviceDocument
      .findOne({ id: deviceId })
      .then((device) =>
        device
          ? Promise.resolve(true)
          : Promise.reject(`Device with id ${deviceId} does not exist.`)
      )
      .catch((error) => Promise.reject(error));
  }
}
