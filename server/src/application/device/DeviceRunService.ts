import { DeviceRunInterface } from "./DeviceRunInterface";
import { Switch } from "../../domain/Switch";
import { Device } from "../../domain/Device";
import { CachedDevice } from "../../domain/CachedDevices";
import { PressButtonPerformer } from "../../domain/PressButtonPerformer";

export class DeviceRunService implements DeviceRunInterface {
  private cachedDevices: CachedDevice;
  private switchPerformer: PressButtonPerformer;
  constructor(cachedDevices: CachedDevice) {
    this.cachedDevices = cachedDevices;
    this.switchPerformer = PressButtonPerformer.getInstance();
  }

  public async switchOn(device: Device) {
    if (device.deviceType === "switch") {
      if (this.isOn(device.id)) {
        return Promise.resolve("Device is currently on");
      }
      this.cachedDevices.changeStatus(device.id, true);
    }
    return this.switchPerformer.pressButton(device, true);
  }

  public async switchOff(device: Device) {
    if (device.deviceType === "switch") {
      if (!this.isOn(device.id)) {
        return Promise.resolve("Device is currently off");
      }
      this.cachedDevices.changeStatus(device.id, false);
      return this.switchPerformer.pressButton(device, false);
    }
    return Promise.reject("Meter can not be switched off");
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
