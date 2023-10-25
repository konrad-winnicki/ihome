import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { Device } from "../../domain/Device";
import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManager";
import { DeviceRepository } from "../../application/device/DeviceRepository";

export class CacheDeviceRepository implements DeviceRepository {
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
    return new Promise<ManagerResponse<object|string>>((resolve) => {
      this.cachedDevices.add(device);
      const messageSuccess = this.serverMessages.addDevice.SUCCESS;
      const resolveMessage = { [messageSuccess]: device.id };
      resolve(resolveMessage);
    }).catch((err) => {
      const messageFailure = this.serverMessages.addDevice.FAILURE;
      return Promise.reject({ [messageFailure]: err });
    });
  }

  async delete(deviceId: string): Promise<ManagerResponse<object|string>> {
    return new Promise<ManagerResponse<object|string>>((resolve, reject) => {
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

  async listByType(deviceType: string): Promise<Device[]> {
    return new Promise((resolve, reject) => {
      const devicesMap = this.cachedDevices.devices;
      const keysValues = Array.from(devicesMap.values());
      const devicesByType = keysValues.filter((device) => {
        if (device.deviceType === deviceType) {
          return device;
        }
      });
      if (devicesByType) {
        return resolve(devicesByType);
      }
      return reject({ error: "error during listing" });
    });
  }

  getById(deviceId: string): Promise<Device> {
    return new Promise((resolve, reject) => {
      const devicesMap = this.cachedDevices.devices;
      const device = devicesMap.get(deviceId);
      if (device) {
        return resolve(device);
      }
      return reject({ NonExistsError: "device not found" });
    });
  }
}
