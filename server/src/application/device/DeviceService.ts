import { Meter } from "../../domain/Meter";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { EventEmitter } from "node:events";
import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../task/TaskManager";
import { DeviceRepository } from "./DeviceRepository";

//interface devicePersistence: adddevuce, deleteDevice, getMenager, Getswitch
//mongo lub file impelement devicePersistence intrtface

export class DeviceService {
  private cacheRepository: DeviceRepository;
  private deviceRepository: DeviceRepository;
  private eventEmitter: EventEmitter;
  private serverMessages: ServerMessages;

  constructor(
    cacheRepository: DeviceRepository,
    deviceRepository: DeviceRepository,
    eventEmitter: EventEmitter,
    serverMessages: ServerMessages
  ) {
    this.deviceRepository = deviceRepository;
    this.cacheRepository = cacheRepository;
    this.eventEmitter = eventEmitter;
    this.serverMessages = serverMessages;
  }

  async addDevice(device: Device): Promise<ManagerResponse<object | string>> {
    return this.cacheRepository
      .add(device)
      .catch((err) => {
        const messageFailure = this.serverMessages.addDevice.FAILURE;
        return Promise.reject({ [messageFailure]: err });
      })
      .then((addingCompleted) =>
        this.deviceRepository
          .add(device)
          .then(() => Promise.resolve(addingCompleted))
          .catch((deviceRepositoryError) =>
            this.compensateDeviceAdditionToMemory(device.id)
              .catch((compensationError) => {
                const rejectMessage = {
                  Error: deviceRepositoryError,
                  compensation: compensationError,
                };
                console.log(rejectMessage);
                return Promise.reject(rejectMessage);
              })
              .then((compensationResult) => {
                const rejectMessage = {
                  Error: deviceRepositoryError,
                  compensation: compensationResult,
                };
                console.log(rejectMessage);
                return Promise.reject(rejectMessage);
              })
          )
      );
  }

  private async compensateDeviceAdditionToMemory(
    deviceId: string
  ): Promise<ManagerResponse<object | string>> {
    return this.cacheRepository
      .delete(deviceId)
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

  async deleteDevice(
    deviceId: string
  ): Promise<ManagerResponse<object | string>> {
    const device = InMemoryDeviceStorage.getInstance().devices.get(
      deviceId
    ) as Device;

    return this.cacheRepository
      .delete(deviceId)
      .catch((err) => {
        return Promise.reject(err);
      })
      .then((response) =>
        this.deviceRepository
          .delete(deviceId)
          .catch((deviceRepositoryError) =>
            this.compensateDeviceDelationFromMemory(device)
              .then((compensationResult: ManagerResponse<object | string>) => {
                const rejectMessage = {
                  error: deviceRepositoryError,
                  compensation: compensationResult,
                };
                return Promise.reject(rejectMessage);
              })
              .catch((compensationError: ManagerResponse<object | string>) => {
                const rejectMessage = {
                  error: deviceRepositoryError,
                  compensation: compensationError,
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
    return this.cacheRepository
      .add(device)
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
    return this.deviceRepository
      .listByType("meter")
      .then((devices) => {
        const meters = devices as unknown as Meter[];
        return Promise.resolve(meters);
      })
      .catch((err) =>
        Promise.reject(`Getting meter list failed due error: ${err}`)
      );
  }

  async getSwitchList(): Promise<Switch[]> {
    return this.deviceRepository
      .listByType("switch")
      .then((devices) => {
        const switches = devices as unknown as Switch[];
        return Promise.resolve(switches);
      })
      .catch((err) =>
        Promise.reject(`Getting meter list failed due error: ${err}`)
      );
  }

  getById(deviceId: string): Promise<Device> {
    return this.deviceRepository
      .getById(deviceId)
      .then((device) =>
        device
          ? Promise.resolve(device)
          : Promise.reject({
              Error: `Device with id ${deviceId} does not exist.`,
            })
      )
      .catch((error) => Promise.reject(error));
  }
}
