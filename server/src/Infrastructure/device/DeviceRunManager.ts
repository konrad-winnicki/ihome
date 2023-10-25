import sanitizedConfig from "../../../config/config";

import { exec } from "child_process";
import { DeviceRun } from "../../application/device/DeviceRunInterface";
import { Switch } from "../../domain/Switch";
import { Device } from "../../domain/Device";
import util from "util";

const execAsync = util.promisify(exec);

export class DeviceRunManager implements DeviceRun {
  switchOn(device: Device) {
    return this.executeScriptAndCollectSdtout(device.commandOn);
  }

  switchOff(device: Switch) {
    return this.executeScriptAndCollectSdtout(device.commandOff);
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
        sanitizedConfig.NODE_ENV === "test" ? 500 : 60000
      );
    });

    try {
      return await Promise.race([collectStdOut(), timeoutPromise]);
    } catch (err) {
      return Promise.reject(`Acomplished with error: ${err}`);
    }
  }
}
