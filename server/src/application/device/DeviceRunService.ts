import sanitizedConfig from "../../../config/config";
import { exec } from "child_process";
import { DeviceRunInterface } from "./DeviceRunInterface";
import { Switch } from "../../domain/Switch";
import util from "util";
import { Device } from "../../domain/Device";
import { cachedDevice } from "../../domain/CachedDevices";

const execAsync = util.promisify(exec);

export class DeviceRunService implements DeviceRunInterface {
  private cachedDevices: cachedDevice;

  constructor(cachedDevices: cachedDevice) {
    this.cachedDevices = cachedDevices;
  }

  async switchOn(device: Device) {
    if (device.deviceType === "switch") {
      this.cachedDevices.changeStatus(device.id, true);
      console.log(this.cachedDevices.devices);
    }
    return this.executeScriptAndCollectSdtout(device.commandOn);
  }

  async switchOff(device: Device) {
    if (device.deviceType === "switch") {
      const switchDevice = device as Switch;
      this.cachedDevices.changeStatus(device.id, false);
      return this.executeScriptAndCollectSdtout(switchDevice.commandOff);
    }
    return Promise.reject("Meter can be only switched on");
  }

  async getById(deviceId: string): Promise<Device> {
    return new Promise((resolve, reject) => {
      const devices = this.cachedDevices.devices;
      const device = devices.get(deviceId);
      console.log("cached dev", devices);
      console.log("searched device", device);
      return device
        ? resolve(device)
        : reject({
            NonExistsError: `Device with id ${deviceId} does not exist.`,
          });
    });
  }

  async executeScriptAndCollectSdtout(command: string): Promise<string> {
    const collectStdOut = async () => {
      console.log("Running command:", command);
      const { stdout } = await execAsync(command);
      return Promise.resolve(
        stdout ? stdout : "Acomplished succesfuly but not data collected"
      );
    };

    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(
        () => {
          resolve("Timeout: Proccess not ended. Not waiting more for stdout.");
        },
        sanitizedConfig.NODE_ENV.includes("test") ? 500 : 60000
      );
    });

    try {
      return await Promise.race([collectStdOut(), timeoutPromise]);
    } catch (err) {
      return Promise.reject(`Acomplished with error: ${err}`);
    }
  }
}
