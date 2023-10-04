import { Meter } from "../../domain/Meter";
import { Switch } from "../../domain/Switch";

export interface DeviceListingInterface {
  getMeterList: () => Promise<Meter[]>;
  getSwitchList: () => Promise<Switch[]>;
}
