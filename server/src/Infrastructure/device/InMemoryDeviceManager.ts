import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { DeviceInterface } from "../../application/device/DeviceInterface";
import { Device } from "../../domain/Device";
import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManagerInterface";
//const appCron = new AppCron();

export class InMemoryDeviceManager implements DeviceInterface {
  private devicesInMemory: InMemoryDeviceStorage;
  private serverMessages: ServerMessages;
  constructor(
    deviceMap: InMemoryDeviceStorage,
    serverMessages: ServerMessages
  ) {
    this.devicesInMemory = deviceMap;
    this.serverMessages = serverMessages;
  }

  async addDevice(device: Device): Promise<ManagerResponse<object | string>> {
    return new Promise<ManagerResponse<string>>((resolve) => {
      this.devicesInMemory.addDevice(device);
      const messageSuccess = this.serverMessages.addDevice.SUCCESS;
      resolve({ [messageSuccess]: device.id });
    }).catch((err) => {
      const messageFailure = this.serverMessages.addDevice.FAILURE;
      return Promise.reject({ [messageFailure]: err });
    });
  }

  async deleteDevice(deviceId: string): Promise<ManagerResponse<string>> {
    return new Promise((resolve, reject) => {
      const devicesList = this.devicesInMemory.devices;
      const isExistingDevice = devicesList.get(deviceId);
      if (!isExistingDevice) {
        const messageFailure = this.serverMessages.deleteDevice.FAILURE;

        reject({[messageFailure]: 'device not exists'});
      }
      this.devicesInMemory.deleteDevice(deviceId);
      const messageSuccess = this.serverMessages.deleteDevice.SUCCESS;

      resolve({[messageSuccess]: "No errors"});
    });
  }
}
