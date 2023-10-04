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
    console.log("call times");
    try {
      this.devicesInMemory.addDevice(device);
      return Promise.resolve("Success")
    } catch (err) {
      console.log("LOCAL stoirage ERR", err);
      return Promise.reject(err)
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
      return Promise.reject(`Device with ${deviceId} not exists`)
    } catch (err) {
      return Promise.reject(err)
    }

      }
}
