import { v4 } from "uuid";
import { Switch } from "../../domain/Switch";
import { Meter } from "../../domain/Meter";

export function prepareSwitchClassInstance(switchDevice: Switch) {
  return new Switch(
    v4(),
    switchDevice.deviceType,
    switchDevice.name,
    switchDevice.commandOn,
    switchDevice.commandOff
  );
}

export function prepareMeterClassInstance(meter: Meter) {
  return new Meter(
    v4(),
    meter.deviceType,
    meter.name,
    meter.parameters,
    meter.commandOn
  );
}
