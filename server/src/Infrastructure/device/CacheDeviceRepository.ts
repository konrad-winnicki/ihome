import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { Device } from "../../domain/Device";
import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManager";
import { DeviceRepository } from "../../application/device/DeviceRepository";

export class CacheDeviceRepository implements DeviceRepository {
  private cachedDevices: InMemoryDeviceStorage;
  private delegate: DeviceRepository;
  private serverMessages: ServerMessages;
  constructor(
    cachedDevices: InMemoryDeviceStorage,
    delegate: DeviceRepository,
    serverMessages: ServerMessages
  ) {
    this.cachedDevices = cachedDevices;
    this.delegate = delegate;
    this.serverMessages = serverMessages;
  }

  async add(device: Device): Promise<ManagerResponse<object | string>> {
    return this.delegate.add(device).then(() => {
      return new Promise<ManagerResponse<object | string>>((resolve) => {
        this.cachedDevices.add(device);
        const messageSuccess = this.serverMessages.addDevice.SUCCESS;
        const resolveMessage = { [messageSuccess]: device.id };
        resolve(resolveMessage);
      }).catch((delegateError) =>
        this.compensateDeviceAddition(device.id)
          .catch((compensationError) => {
            const rejectMessage = {
              Error: delegateError,
              compensation: compensationError,
            };
            console.log(rejectMessage);
            return Promise.reject(rejectMessage);
          })
          .then((compensationResult) => {
            const rejectMessage = {
              Error: delegateError,
              compensation: compensationResult,
            };
            console.log(rejectMessage);
            return Promise.reject(rejectMessage);
          })
      );
    });
  }

  async delete(deviceId: string): Promise<ManagerResponse<object | string>> {
    return this.getById(deviceId)
      .then((device) => this.deleteDevice(device))
      .catch((error) => {
        const messageFailure = this.serverMessages.deleteDevice.FAILURE;
        return Promise.reject({ [messageFailure]: error });
      });
  }

  async deleteDevice(
    device: Device
  ): Promise<ManagerResponse<object | string>> {
    const deviceId = device.id;
    return this.delegate.delete(deviceId).then(() => {
      return new Promise<ManagerResponse<object | string>>(
        (resolve) => {
          this.cachedDevices.delete(deviceId);
          const messageSuccess = this.serverMessages.deleteDevice.SUCCESS;
          resolve({ [messageSuccess]: "No errors" });
        }
      ).catch((delegateError) =>
        this.compensateDeviceDelation(device)
          .then((compensationResult: ManagerResponse<object | string>) => {
            const rejectMessage = {
              error: delegateError,
              compensation: compensationResult,
            };
            return Promise.reject(rejectMessage);
          })
          .catch((compensationError: ManagerResponse<object | string>) => {
            const rejectMessage = {
              error: delegateError,
              compensation: compensationError,
            };
            return Promise.reject(rejectMessage);
          })
      );
    });
  }

  async listByType(deviceType: string): Promise<Device[]> {
    return this.delegate.listByType(deviceType);
  }

  getById(deviceId: string): Promise<Device> {
    return this.delegate.getById(deviceId);
  }

  private async compensateDeviceAddition(
    deviceId: string
  ): Promise<ManagerResponse<object | string>> {
    return this.delegate
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

  private async compensateDeviceDelation(
    device: Device
  ): Promise<ManagerResponse<object | string>> {
    return this.delegate
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
}
