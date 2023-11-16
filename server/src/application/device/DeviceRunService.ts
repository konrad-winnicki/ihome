import { DeviceRunInterface } from "./DeviceRunInterface";
import { Switch } from "../../domain/Switch";
import { Device } from "../../domain/Device";
import { CachedDevice } from "../../domain/CachedDevices";
import { DevicePerformer } from "../../domain/DevicePerformer";

//PYTANIA: czy devicePerformer powinien byc przekazywany kalo zaleznosc
// czy inicjalizowany w konstruktorze
export class DeviceRunService implements DeviceRunInterface {
  private cachedDevices: CachedDevice;
  private devicePerformer: DevicePerformer;
  constructor(cachedDevices: CachedDevice) {
    this.cachedDevices = cachedDevices;
    this.devicePerformer = DevicePerformer.getInstance();
  }

  public async switchOn(deviceId: string) {
    return this.getById(deviceId).then((device) => {
      if (device.deviceType === "switch") {
        if (this.isOn(device.id)) {
          return Promise.reject("Device is currently on");
        }
        this.cachedDevices.changeStatus(device.id, true);
      }
      return this.devicePerformer.switchOn(device);
    });
  }

  public async switchOff(deviceId: string) {
    return this.getById(deviceId).then((device) => {
      if (device.deviceType === "switch") {
        if (!this.isOn(deviceId)) {
          return Promise.reject("Device is currently off");
        }
        this.cachedDevices.changeStatus(device.id, false);

        return this.devicePerformer.switchOff(device as Switch);
      }
      return Promise.reject('Sensor has only "on" option');
    });
  }

  //ASK: czy getById nie powinno byc wolane przez switchOff i switchOn
  public async getById(deviceId: string): Promise<Device> {
    return new Promise((resolve, reject) => {
      const devices = this.cachedDevices.devices;
      const device = devices.get(deviceId);
      return device
        ? resolve(device)
        : reject({
            NonExistsError: `Device with id ${deviceId} does not exist.`,
          });
    });
  }

  isOn(deviceId: string): boolean {
    return (this.cachedDevices.devices.get(deviceId) as Switch).onStatus;
  }
}
