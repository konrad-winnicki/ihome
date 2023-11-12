import sanitizedConfig from "../../../config/config";

import { exec } from "child_process";
import { DeviceRunInterface } from "./DeviceRunInterface";
import { Switch } from "../../domain/Switch";
import util from "util";
import { ActivatedSwitches } from "../../domain/ActivatedSwitches";
import { Device } from "../../domain/Device";
import { cachedDevice } from "../../domain/CachedDevices";

const execAsync = util.promisify(exec);

export class DeviceRunService implements DeviceRunInterface {
  // private persistenceRepository: DeviceRepository;
  private cachedDevices: cachedDevice;

  constructor(cachedDevices: cachedDevice) {
    this.cachedDevices = cachedDevices;
  }

  async switchOn(deviceId: string) {
    return this.getById(deviceId)
      .then((device) => {
        if (device.deviceType === "switch") {
          const runningSwitches = ActivatedSwitches.getInstance();
          runningSwitches.add(deviceId);
          console.log(runningSwitches.switchDevices);
        }
        return this.executeScriptAndCollectSdtout(device.commandOn);
      })
      .catch((error) =>
        Promise.reject({ ["Error occured during switching on"]: error })
      );
  }

  async switchOff(deviceId: string) {
    return this.getById(deviceId)
      .then((device) => {
        if (device.deviceType === "switch") {
          const runningSwitches = ActivatedSwitches.getInstance();
          console.log("service", runningSwitches);
          runningSwitches.delete(deviceId);

          const switchDevice = device as Switch;
          return this.executeScriptAndCollectSdtout(switchDevice.commandOff);
        }
        return Promise.reject({ error: "wrong device passed" });
      })
      .catch((error) =>
        Promise.reject({ ["Error occured during switching off"]: error })
      );
  }

  async listActivatedSwitches(): Promise<Array<string>> {
    return new Promise<Array<string>>((resolve) => {
      const activatedSwitches = ActivatedSwitches.getInstance();
      resolve(activatedSwitches.switchDevices);
    });
  }

  getById(deviceId: string): Promise<Device> {
    return new Promise((resolve, reject) => {
      const devices = this.cachedDevices.devices;
      const deviceProperty = devices.get(deviceId);
      return deviceProperty
        ? resolve(deviceProperty.device)
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
