import { Model, mongo } from "mongoose";
import { Meter } from "../../domain/Meter";
import { DeviceInterface } from "../../application/device/DeviceInterface";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
import { DeviceListingInterface } from "../../application/device/DeviceListingInterface";
import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { EventEmitter } from "node:events";
import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManagerInterface";

export class MongoDeviceManager
  implements DeviceInterface, DeviceListingInterface
{
  private deviceDocument: Model<Device>;
  private eventEmitter: EventEmitter;
  private serverMessages: ServerMessages;

  delegate: DeviceInterface;

  constructor(
    delegate: DeviceInterface,
    deviceDocument: Model<Device>,
    eventEmitter: EventEmitter,
    serverMessages: ServerMessages
  ) {
    this.deviceDocument = deviceDocument;
    this.delegate = delegate;
    this.eventEmitter = eventEmitter;
    this.serverMessages = serverMessages;
  }

  async addDevice(device: Device): Promise<ManagerResponse<object | string>> {
    return this.delegate
      .addDevice(device)
      .catch((err) => {
        const messageFailure = this.serverMessages.addDevice.FAILURE;
        return Promise.reject({ [messageFailure]: err });
      })
      .then((addingCompleted) =>
        this.deviceDocument
          .create(device)
          .then(() => Promise.resolve(addingCompleted))
          .catch((dbError) =>
            this.compensateDeviceAdditionFromMemory(device.id)
              .catch((compensationError) => {
                const messageFailure = this.serverMessages.addTask.FAILURE;
                const rejectMessage = {
                  [messageFailure]: {
                    error: this.translateDbError(dbError),
                    compensation: compensationError,
                  },
                };
                return Promise.reject(rejectMessage);
              })
              .then((compensationResult) => {
                console.log("THEN", compensationResult);

                const messageFailure = this.serverMessages.addDevice.FAILURE;
                const rejectMessage = {
                  [messageFailure]: {
                    error: this.translateDbError(dbError),
                    compensation: compensationResult,
                  },
                };
                console.log("THEN2", rejectMessage);
                return Promise.reject(rejectMessage);
              })
          )
      );
  }

  private translateDbError(dbError: Error) {
    return dbError instanceof mongo.MongoServerError
      ? {
          MongoServerError: this.uniqueViolationErrorHandler(dbError),
        }
      : { Error: dbError };
  }

  private async compensateDeviceAdditionFromMemory(
    deviceId: string
  ): Promise<ManagerResponse<object | string>> {
    return this.delegate
      .deleteDevice(deviceId)
      .then((response) => {
        const messageSuccess = this.serverMessages.compensation.SUCCESS;
        const resolveMessage = {
          [messageSuccess]: response,
        };
        return Promise.resolve(resolveMessage);
      })
      .catch((err) => {
        const messageFailure = this.serverMessages.compensation.FAILURE;
        const rejectMessage = { [messageFailure]: err };

        console.log(rejectMessage);
        return Promise.reject(rejectMessage);
      });
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("name")) {
      return { Error: this.serverMessages.mongoServerError.NAME_DUPLICATION };
    }
    return { Error: err };
  }

  async deleteDevice(
    deviceId: string
  ): Promise<ManagerResponse<object | string>> {
    const device = InMemoryDeviceStorage.getInstance().devices.get(
      deviceId
    ) as Device;

    return this.delegate
      .deleteDevice(deviceId)
      .catch((err) => {
        return Promise.reject(err);
      })
      .then((response) =>
        this.deviceDocument
          .deleteOne({ id: deviceId })
          .catch((error) =>
            this.compensateDeviceDelationFromMemory(device)
              .then((compensationResult: ManagerResponse<object | string>) => {
                const messageFailure = this.serverMessages.deleteTask.FAILURE;
                const rejectMessage = {
                  [messageFailure]: {
                    error: error,
                    compensation: compensationResult,
                  },
                };
                return Promise.reject(rejectMessage);
              })
              .catch((compensationError: ManagerResponse<object | string>) => {
                const messageFailure = this.serverMessages.deleteDevice.FAILURE;
                const rejectMessage = {
                  [messageFailure]: {
                    error: error,
                    compensation: compensationError,
                  },
                };
                return Promise.reject(rejectMessage);
              })
          )
          .then(() => {
            console.log(response);
            this.eventEmitter.emit("deviceDeleted", deviceId);
            return Promise.resolve(response);
          })
      );
  }

  private async compensateDeviceDelationFromMemory(
    device: Device
  ): Promise<ManagerResponse<object | string>> {
    return this.delegate
      .addDevice(device)
      .then((response) => {
        const messageSuccess = this.serverMessages.compensation.SUCCESS;
        const resolveMessage = {
          [messageSuccess]: response,
        };
        console.log(resolveMessage);
        return Promise.resolve(resolveMessage);
      })
      .catch((err) => {
        const messageFailure = this.serverMessages.compensation.FAILURE;
        const rejectMessage = { [messageFailure]: err };

        console.log(rejectMessage);
        return Promise.reject(rejectMessage);
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
          : Promise.reject({Error: `Device with id ${deviceId} does not exist.`})
      )
      .catch((error) => Promise.reject(error));
  }
}
