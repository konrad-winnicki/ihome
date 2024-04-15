import { DeviceRunInterface } from "./DeviceRunInterface";
import { Switch } from "../../domain/Switch";
import { Device } from "../../domain/Device";
import { CachedDevice } from "../../infrastructure/cache/CachedDevices";
import { CommandExecutor } from "../../infrastructure/command/CommandExecutor";

export class DeviceRunService implements DeviceRunInterface {
  private cachedDevices: CachedDevice;
  private commandExecutor: CommandExecutor;
  constructor(cachedDevices: CachedDevice) {
    this.cachedDevices = cachedDevices;
    this.commandExecutor = CommandExecutor.getInstance();
    this.switchOn = this.switchOn.bind(this);
    this.switchOff = this.switchOff.bind(this);
  }

  public async switchOn(deviceId: string) {
    return this.getById(deviceId).then((device) => {
      if (this.isOn(device.id)) {
        return Promise.reject("Device is currently on");
      }

      return this.commandExecutor.switchOn(device).then((response) => {
        if (device.deviceType === "switch") {
          this.cachedDevices.changeStatus(device.id, true);
        }
        return response;
      });
    });
  }

  public async switchOff(deviceId: string) {
    return this.getById(deviceId).then((device) => {
      if (device.deviceType === "sensor") {
        return Promise.reject(
          'Sensor has only "on" option and cannot be switched off'
        );
      }
      if (!this.isOn(deviceId)) {
        return Promise.reject("Device is currently off");
      }

      return this.commandExecutor
        .switchOff(device as Switch)
        .then((response) => {
          this.cachedDevices.changeStatus(device.id, false);
          return response;
        });
    });
  }

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

  private isOn(deviceId: string): boolean {
    return (this.cachedDevices.devices.get(deviceId) as Switch).onStatus;
  }
}
