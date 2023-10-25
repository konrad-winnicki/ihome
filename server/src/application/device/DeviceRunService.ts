import { DeviceRun as DeviceRun } from "./DeviceRunInterface";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";

export class DeviceRunService {
  private deviceRunInterface: DeviceRun;
  constructor(deviceRunService: DeviceRun) {
    this.deviceRunInterface = deviceRunService;
  }

  switchOn(device: Device): Promise<string> {
    return this.deviceRunInterface.switchOn(device);
  }

  switchOff(device: Switch): Promise<string> {
    return this.deviceRunInterface.switchOff(device);
  }
}
