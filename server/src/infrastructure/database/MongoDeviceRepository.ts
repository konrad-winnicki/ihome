import { Model, mongo } from "mongoose";
import { Device } from "../../domain/Device";
import { DeviceRepository } from "../../application/device/DeviceRepositoryInterface";
import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManagerInterface";

export class MongoDeviceRepository implements DeviceRepository {
  private deviceDocument: Model<Device>;
  private serverMessages: ServerMessages;

  constructor(deviceDocument: Model<Device>, serverMessages: ServerMessages) {
    this.deviceDocument = deviceDocument;
    this.serverMessages = serverMessages;
  }

  async add(device: Device): Promise<ManagerResponse<object | string>> {
    return this.deviceDocument
      .create(device)
      .then(() => {
        const messageSuccess = this.serverMessages.addDevice.SUCCESS;
        const resolveMessage = { [messageSuccess]: device.id };

        return Promise.resolve(resolveMessage);
      })
      .catch((error) => {
        const errorToPass =
          error instanceof Error ? this.translateDbError(error) : error;

        const messageFailure = this.serverMessages.addDevice.FAILURE;
        const rejectMessage = {
          [messageFailure]: errorToPass,
        };
        return Promise.reject(rejectMessage);
      });
  }

  private translateDbError(error: Error) {
    return error instanceof mongo.MongoServerError
      ? this.uniqueViolationErrorHandler(error)
      : { error: error.message };
  }

  private uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("name")) {
      return { error: this.serverMessages.uniqueViolation.NAME_DUPLICATION };
    }
    return { error: err.message };
  }

  async delete(deviceId: string): Promise<ManagerResponse<string>> {
    return this.deviceDocument
      .deleteOne({ id: deviceId })
      .then(() => {
        const messageSuccess = this.serverMessages.deleteDevice.SUCCESS;

        const resolveMessage = { [messageSuccess]: "No errors" };
        return Promise.resolve(resolveMessage);
      })
      .catch((error) => {
        const messageFailure = this.serverMessages.deleteDevice.FAILURE;
        const rejectMessage = { [messageFailure]: error };
        return Promise.reject(rejectMessage);
      });
  }

  async listByType(deviceType: string): Promise<Device[]> {
    const persistencieError = this.serverMessages.persistenceError;

    return this.deviceDocument
      .find({ deviceType: deviceType })
      .then((devices) => Promise.resolve(devices))
      .catch((error) => Promise.reject({ [persistencieError]: error }));
  }

  async getById(deviceId: string): Promise<Device> {
    const persistenceError = this.serverMessages.persistenceError;
    return this.deviceDocument
      .findOne({ id: deviceId })
      .then((device) =>
        device
          ? Promise.resolve(device)
          : Promise.reject({
              NonExistsError: `Device with id ${deviceId} does not exist.`,
            })
      )
      .catch((error) => Promise.reject({ [persistenceError]: error }));
  }
}
