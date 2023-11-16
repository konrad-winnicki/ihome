import { v4 } from "uuid";
import { Switch } from "../../../../domain/Switch";
import { Sensor } from "../../../../domain/Sensor";

export function prepareSwitchClassInstance(switchDevice: Switch) {
  return new Switch(
    v4(),
    switchDevice.deviceType,
    switchDevice.name,
    switchDevice.commandOn,
    switchDevice.commandOff
  );
}

export function prepareMeterClassInstance(meter: Sensor) {
  return new Sensor(
    v4(),
    meter.deviceType,
    meter.name,
    meter.parameters,
    meter.commandOn
  );
}
