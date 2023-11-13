import sanitizedConfig from "../../config/config";
import { Device } from "./Device";
import { Switch } from "./Switch";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export class PressButtonPerformer {
  private static instance: PressButtonPerformer | null = null;

  public static getInstance() {
    if (!PressButtonPerformer.instance) {
      PressButtonPerformer.instance = new PressButtonPerformer();
    }
    return PressButtonPerformer.instance;
  }

  public async pressButton(device: Device, onStatus: boolean) {
    if (onStatus) {
      return this.executeAndCollectSdtout(device.commandOn);
    } else if (device.deviceType === "switch")
      return this.executeAndCollectSdtout((device as Switch).commandOff);

    return Promise.reject("Meter can only be switched on");
  }

  async executeAndCollectSdtout(command: string): Promise<string> {
    const collectStdOut = async () => {
      console.log("Running command:", command);
      const { stdout } = await execAsync(command);
      return Promise.resolve(
        stdout ? stdout : "Acomplished succesfuly but not data collected"
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

  async longLastingProcResolver() {
    return new Promise<string>((resolve) => {
      setTimeout(
        () => {
          resolve("Timeout: Proccess not ended. Not waiting more for stdout.");
        },
        sanitizedConfig.NODE_ENV.includes("test") ? 500 : 60000
      );
    });
  }
}
