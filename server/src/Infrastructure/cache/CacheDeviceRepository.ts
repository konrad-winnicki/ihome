import { CachedDevice } from "./CachedDevices";
import { Device } from "../../domain/Device";
import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManager";
import { DeviceRepository } from "../../application/device/DeviceRepository";

export class CacheDeviceRepository implements DeviceRepository {
  private cachedDevices: CachedDevice;
  private delegate: DeviceRepository;
  private serverMessages: ServerMessages;
  constructor(
    cachedDevices: CachedDevice,
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
      }).catch((error) => {
        const errorToPass = error instanceof Error ? error.message : error;

        return this.compensateDeviceAddition(device.id)
          .catch((compensationError) => {
            const rejectMessage = {
              Error: errorToPass,
              compensation: compensationError,
            };
            console.log(rejectMessage);
            return Promise.reject(rejectMessage);
          })
          .then((compensationResult) => {
            const rejectMessage = {
              Error: errorToPass,
              compensation: compensationResult,
            };
            console.log(rejectMessage);
            return Promise.reject(rejectMessage);
          });
      });
    });
  }

  async delete(deviceId: string): Promise<ManagerResponse<object | string>> {
    return this.getById(deviceId)
      .then((device) => this.deleteDevice(device))
      .catch((error) => {
        console.log("__final delete", error);
        const messageFailure = this.serverMessages.deleteDevice.FAILURE;
        return Promise.reject({ [messageFailure]: error });
      });
  }

  async deleteDevice(
    device: Device
  ): Promise<ManagerResponse<object | string>> {
    const deviceId = device.id;
    return this.delegate.delete(deviceId).then((res) => {
      console.log("delegate res", res);
      return new Promise<ManagerResponse<object | string>>((resolve) => {
        this.cachedDevices.delete(deviceId);
        const messageSuccess = this.serverMessages.deleteDevice.SUCCESS;
        resolve({ [messageSuccess]: "No errors" });
      }).catch((error) => {
        const errorToPass = error instanceof Error ? error.message : error;
        return this.compensateDeviceDelation(device)
          .then((compensationResult: ManagerResponse<object | string>) => {
            return Promise.reject(compensationResult);
          })
          .catch((compensationError: ManagerResponse<object | string>) => {
            const rejectMessage = {
              error: errorToPass,
              compensation: compensationError,
            };
            return Promise.reject(rejectMessage);
          });
      });
    });
  }

  async listByType(deviceType: string): Promise<Device[]> {
    const devices = [...this.cachedDevices.devices.values()].filter(
      (device) => {
        return device.deviceType === deviceType;
      }
    );
    if (devices.length !== 0) {
      return devices;
    }

    return this.delegate.listByType(deviceType).then((devices) => {
      devices.forEach((device) => {
        this.cachedDevices.add(device);
      });
      return devices;
    });
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
