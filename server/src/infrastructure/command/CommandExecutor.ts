import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export class CommandExecutor {
  private static instance: CommandExecutor | null = null;

  public static getInstance() {
    if (!CommandExecutor.instance) {
      CommandExecutor.instance = new CommandExecutor();
    }
    return CommandExecutor.instance;
  }

  public async switchOn(device: Device) {
    return this.executeAndCollectSdtout(device.commandOn);
  }

  public async switchOff(device: Switch) {
    return this.executeAndCollectSdtout(device.commandOff);
  }

  private async executeAndCollectSdtout(command: string): Promise<string> {
    try {
      return await Promise.race([
        this.collectStdOut(command),
        this.longLastingProcResolver(),
      ]);
    } catch (err) {
      return Promise.reject(`Acomplished with error: ${err}`);
    }
  }

  private async collectStdOut(command:string) {
    console.log("Running command:", command);
    const { stdout } = await execAsync(command);
    return Promise.resolve(
      stdout ? stdout : "Acomplished successfuly but not data collected"
    );
  }

  private async longLastingProcResolver() {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve("Timeout: Proccess not ended. Not waiting more for stdout.");
      }, appConfiguration.SWITCH_REPLY_TIMEOUT);
    });
  }
}
