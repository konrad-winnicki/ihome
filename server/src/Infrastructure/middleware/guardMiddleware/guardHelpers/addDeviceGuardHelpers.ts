import { Sensor } from "../../../../domain/Sensor";
import { Switch } from "../../../../domain/Switch";
import {
  checkIfNotExceededParams,
  checkIfNotMissingParams,
} from "./guardFunctionHelpers";

export function isSensor(maybeSensor: Sensor) {
  const expectedParameters = ["deviceType", "name", "parameters", "commandOn"];

  function chackIfParametersObjectValid() {
    for (const key in maybeSensor.parameters) {
      if (
        typeof key !== "string" ||
        typeof maybeSensor.parameters[key] !== "string"
      ) {
        return false;
      }
    }
    return true;
  }

  return (
    checkIfNotExceededParams(maybeSensor, expectedParameters) &&
    checkIfNotMissingParams(maybeSensor, expectedParameters) &&
    chackIfParametersObjectValid() &&
    typeof maybeSensor.name === "string" &&
    typeof maybeSensor.commandOn === "string" &&
    typeof maybeSensor.parameters === "object"
  );
}

export function isSwitch(maybeSwitch: Switch) {
  const expectedParameters = ["deviceType", "name", "commandOn", "commandOff"];

  return (
    checkIfNotExceededParams(maybeSwitch, expectedParameters) &&
    checkIfNotMissingParams(maybeSwitch, expectedParameters) &&
    typeof maybeSwitch.name === "string" &&
    typeof maybeSwitch.commandOn === "string" &&
    typeof maybeSwitch.commandOff === "string"
  );
}
