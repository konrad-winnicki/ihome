import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { CacheRepository } from "../../application/device/CacheRepository";
import { Device } from "../../domain/Device";
import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManager";

export class CacheDeviceRepository implements CacheRepository {
  private cachedDevices: InMemoryDeviceStorage;
  private serverMessages: ServerMessages;
  constructor(
    cachedDevices: InMemoryDeviceStorage,
    serverMessages: ServerMessages
  ) {
    this.cachedDevices = cachedDevices;
    this.serverMessages = serverMessages;
  }

  async add(device: Device): Promise<ManagerResponse<object | string>> {
    return new Promise<ManagerResponse<string>>((resolve) => {
      this.cachedDevices.add(device);
      const messageSuccess = this.serverMessages.addDevice.SUCCESS;
      resolve({ [messageSuccess]: device.id });
    }).catch((err) => {
      const messageFailure = this.serverMessages.addDevice.FAILURE;
      return Promise.reject({ [messageFailure]: err });
    });
  }

  async delete(deviceId: string): Promise<ManagerResponse<string>> {
    return new Promise((resolve, reject) => {
      const devicesList = this.cachedDevices.devices;
      const isExistingDevice = devicesList.get(deviceId);
      if (!isExistingDevice) {
        const messageFailure = this.serverMessages.deleteDevice.FAILURE;

        reject({ [messageFailure]: "device not exists" });
      }
      this.cachedDevices.delete(deviceId);
      const messageSuccess = this.serverMessages.deleteDevice.SUCCESS;

      resolve({ [messageSuccess]: "No errors" });
    });
  }
}
