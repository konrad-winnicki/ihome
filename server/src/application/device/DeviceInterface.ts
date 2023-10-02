import { Device} from "../../domain/Device";
import { Meter } from "../../domain/Meter";
import { Switch } from "../../domain/Switch";

export interface DeviceInterface {
  addDeviceToDB: (device: Device) => Promise<string>;
  addDeviceToLocalStorage: (device: Device) => boolean;

  //deleteSwitcher: (switchDeviceId: string) => Promise<boolean>;
  getMeterList: () => Promise<Meter[]>;
  getSwitchList: () => Promise<Switch[]>;
}
