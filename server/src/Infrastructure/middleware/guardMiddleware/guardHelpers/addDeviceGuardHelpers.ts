import { Meter } from "../../../../domain/Meter";
import { Switch } from "../../../../domain/Switch";
import {
  checkIfNotExceededParams,
  checkIfNotMissingParams,
} from "./guardFunctionHelpers";

export function isMeter(maybeMeter: Meter) {
  const expectedParameters = ["deviceType", "name", "parameters", "commandOn"];

  function chackIfParametersObjectValid() {
    for (const key in maybeMeter.parameters) {
      if (
        typeof key !== "string" ||
        typeof maybeMeter.parameters[key] !== "string"
      ) {
        return false;
      }
    }
    return true;
  }

  return (
    checkIfNotExceededParams(maybeMeter, expectedParameters) &&
    checkIfNotMissingParams(maybeMeter, expectedParameters) &&
    chackIfParametersObjectValid() &&
    typeof maybeMeter.name === "string" &&
    typeof maybeMeter.commandOn === "string" &&
    typeof maybeMeter.parameters === "object"
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
