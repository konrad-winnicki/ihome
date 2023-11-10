import sanitizedConfig from "../../../config/config";

import { exec } from "child_process";
import { DeviceRunInterface } from "./DeviceRunInterface";
import { Switch } from "../../domain/Switch";
import util from "util";
import { DeviceRepository } from "./DeviceRepository";
import { RunningSwitches } from "../../domain/RunningSwitches";

const execAsync = util.promisify(exec);

export class DeviceRunService implements DeviceRunInterface {
  private persistenceRepository: DeviceRepository;

  constructor(persistenceRepository: DeviceRepository) {
    this.persistenceRepository = persistenceRepository;
  }

  async switchOn(deviceId: string) {
    return this.persistenceRepository
      .getById(deviceId)
      .then((device) => {
        if (device.deviceType === "switch") {
          const runningSwitches = RunningSwitches.getInstance();
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
    return this.persistenceRepository
      .getById(deviceId)
      .then((device) => {
        if (device.deviceType === "switch") {
          const runningSwitches = RunningSwitches.getInstance();
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

  async listRunningSwitches(): Promise<Array<string>> {
    console.log('finction callled')
    return new Promise<Array<string>>((resolve) => {
      const runningSwitches = RunningSwitches.getInstance();
      resolve(runningSwitches.switchDevices);
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
