import { exec } from "child_process";
import { DeviceRunInterface } from "../../application/device/DeviceRunInterface";
import { Switch } from "../../domain/Switch";
import { Device } from "../../domain/Device";
import util from "util";

const execAsync = util.promisify(exec);

export class DeviceRunManager implements DeviceRunInterface {
  switchOn(device: Device) {
    return this.executeScriptAndReadMessage(device.commandOn)
  }

  switchOff(device: Switch) {
    return this.executeScriptAndReadMessage(device.commandOff)

}

async executeScriptAndReadMessage(
    command: string
  ): Promise<string> {
    try {
      console.log("command", command);
      const { stdout } = await execAsync(command);
      return Promise.resolve(stdout? stdout: "Acomplished succesfuly but not data printed");
    } catch (err) {
      console.log("Standard out error", err);
      return Promise.reject(`Acomplished with error`);
    }
  }

 
}

