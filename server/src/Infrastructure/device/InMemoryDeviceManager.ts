import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { DeviceInterface } from "../../application/device/DeviceInterface";
import { Device } from "../../domain/Device";
//const appCron = new AppCron();

export class InMemoryDeviceManager implements DeviceInterface {
  private devicesInMemory: InMemoryDeviceStorage;
  constructor(deviceMap: InMemoryDeviceStorage) {
    this.devicesInMemory = deviceMap;
  }

  async addDevice(device: Device): Promise<string> {
    return new Promise<string>((resolve) => {
      this.devicesInMemory.addDevice(device);
      resolve(`Device ${device.id} added`);
    }).catch((err) => Promise.reject(`MemoryError: Device not added due to error: ${err}`));
  }

  async deleteDevice(deviceId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const devicesList = this.devicesInMemory.devices;
      const isExistingDevice = devicesList.get(deviceId);
      if (!isExistingDevice) {
        reject(`MemoryError: Device with ${deviceId} not exists.`);
      }
      this.devicesInMemory.deleteDevice(deviceId);
      resolve(`Device ${deviceId} deleted`);
    });
  }
}
