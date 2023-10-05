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
    try {
      this.devicesInMemory.addDevice(device);
      return Promise.resolve("Success")
    } catch (err) {
      return Promise.reject(`Device not added to cache due error: ${err}`)
    }
  }

  async deleteDevice(deviceId:string):Promise<string> {
    try {
      const devicesList = this.devicesInMemory.devices
      const isExistingDevice = devicesList.get(deviceId)
      if (isExistingDevice){
        this.devicesInMemory.deleteDevice(deviceId)
        return Promise.resolve("Succes")

      }
      return Promise.reject(`MemoryError: Device with ${deviceId} not exists`)
    } catch (err) {
      return Promise.reject(`MemoryError: Error during deletion from cache: ${err}`)
    }

      }
}
