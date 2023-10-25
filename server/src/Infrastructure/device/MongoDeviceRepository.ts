import { Model, mongo } from "mongoose";

import { Device } from "../../domain/Device";

import { DeviceRepository } from "../../application/device/DeviceRepository";
import { ServerMessages } from "../../ServerMessages";

//interface devicePersistence: adddevuce, deleteDevice, getMenager, Getswitch
//mongo lub file impelement devicePersistence intrtface

export class MongoDeviceRepository implements DeviceRepository {
  private deviceDocument: Model<Device>;
  private serverMessages: ServerMessages;

  constructor(deviceDocument: Model<Device>, serverMessages: ServerMessages
    ) {
    this.deviceDocument = deviceDocument;
    this.serverMessages = serverMessages;

  }

  async add(device: Device): Promise<void> {
    return this.deviceDocument
      .create(device)
      .then(() => Promise.resolve())
      .catch((error) => {
        const messageFailure = this.serverMessages.addDevice.FAILURE;
        const rejectMessage = {
          [messageFailure]: this.translateDbError(error),
        };
        return Promise.reject(rejectMessage);
      });
  }

  private translateDbError(error: Error) {
    return error instanceof mongo.MongoServerError
      ? {
          mongoServerError: this.uniqueViolationErrorHandler(error),
        }
      : { error: error.message };
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("name")) {
      return { error: this.serverMessages.mongoServerError.NAME_DUPLICATION };
    }
    return { error: err.message };
  }

  async delete(deviceId: string): Promise<void> {
    return this.deviceDocument.deleteOne({ id: deviceId }).then(() =>  Promise.resolve())
    .catch((error) => {
      const messageFailure = this.serverMessages.deleteDevice.FAILURE;
      const rejectMessage = { [messageFailure]: error };
      return Promise.reject(rejectMessage);
    })
  }

  async listByType(deviceType: string): Promise<Device[]> {
    return this.deviceDocument
      .find({ deviceType: deviceType })
      .then((devices) => Promise.resolve(devices));
  }

  getById(deviceId: string): Promise<Device> {
    return this.deviceDocument.findOne({ id: deviceId }).then((device) =>
      device
        ? Promise.resolve(device)
        : Promise.reject({
            Error: `Device with id ${deviceId} does not exist.`,
          })
    );
  }
}
