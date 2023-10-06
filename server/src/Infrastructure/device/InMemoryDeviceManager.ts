import { DeviceInMemory } from "../../domain/DeviceInMemory";
import { DeviceInterface } from "../../application/device/DeviceInterface";
import { Device } from "../../domain/Device";
//const appCron = new AppCron();

export class InMemoryDeviceManager implements DeviceInterface {
  private devicesInMemory: DeviceInMemory;
  constructor(deviceMap: DeviceInMemory) {
    this.devicesInMemory = deviceMap;
  }

  async addDevice(device: Device): Promise<string> {
    return new Promise((resolve) => {
      this.devicesInMemory.addDevice(device);
      resolve(`Device ${device.id} added`);
    });
  }

  async deleteDevice(deviceId: string): Promise<string> {
    try {
      const devicesList = this.devicesInMemory.devices;
      const isExistingDevice = devicesList.get(deviceId);
      if (!isExistingDevice) {
        return Promise.reject(
          `MemoryError: Device with ${deviceId} not exists`
        );
      }
      this.devicesInMemory.deleteDevice(deviceId);
      console.log("DEVICE DELETION SUCCES");
      return Promise.resolve("Succes");
    } catch (err) {
      return Promise.reject(
        `MemoryError: Error during deletion from cache: ${err}`
      );
    }
  }
}
