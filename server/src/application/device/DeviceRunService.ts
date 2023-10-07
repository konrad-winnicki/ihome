import { DeviceRunInterface as DeviceRunInterface } from "./DeviceRunInterface";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";

export class DeviceRunService implements DeviceRunService {
  private deviceRunInterface: DeviceRunInterface;
  constructor(deviceRunService: DeviceRunInterface) {
    this.deviceRunInterface = deviceRunService;
  }

  switchOn(device: Device): Promise<string> {
    return this.deviceRunInterface.switchOn(device);
  }

  switchOff(device: Switch): Promise<string> {
    return this.deviceRunInterface.switchOff(device);
  }
}
