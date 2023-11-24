import { Device } from "./Device";
import { Switch } from "./Switch";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

// CommandExecutor execute(command)
export class DevicePerformer {
  private static instance: DevicePerformer | null = null;

  public static getInstance() {
    if (!DevicePerformer.instance) {
      DevicePerformer.instance = new DevicePerformer();
    }
    return DevicePerformer.instance;
  }

  public async switchOn(device: Device) {
    return this.executeAndCollectSdtout(device.commandOn);
  }

  public async switchOff(device: Switch) {
    return this.executeAndCollectSdtout(device.commandOff);
  }

  private async executeAndCollectSdtout(command: string): Promise<string> {
    const collectStdOut = async () => {
      console.log("Running command:", command);
      const { stdout } = await execAsync(command);
      return Promise.resolve(
        stdout ? stdout : "Acomplished successfuly but not data collected"
      );
    };

    try {
      return await Promise.race([
        collectStdOut(),
        this.longLastingProcResolver(),
      ]);
    } catch (err) {
      return Promise.reject(`Acomplished with error: ${err}`);
    }
  }

  private async longLastingProcResolver() {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve("Timeout: Proccess not ended. Not waiting more for stdout.");
      }, appConfiguration.SWITCH_REPLY_TIMEOUT);
    });
  }
}
