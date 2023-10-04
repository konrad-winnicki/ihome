import { Meter } from "../domain/Meter";
import { Switch } from "../domain/Switch";
import { RunSwitchRequestBody } from "./runDevices/runSwitch";

export function isMeterGuardFunction(maybeMeter: Meter) {
  const expectedParameters = ["deviceType", "name", "parameters", "commandOn"];
  function checkIfNotExceededParams() {
    for (const key in maybeMeter) {
      if (!expectedParameters.includes(key)) {
        return false;
      }
    }
    return true;
  }

  function checkIfNotMissingParams() {
    for (const param of expectedParameters) {
      if (!maybeMeter.hasOwnProperty(param)) {
        return false;
      }
    }

    return true;
  }

  function chackIfParameterObjectValid() {
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
    checkIfNotExceededParams() &&
    checkIfNotMissingParams() &&
    chackIfParameterObjectValid() &&
    typeof maybeMeter.name === "string" &&
    typeof maybeMeter.commandOn === "string"
  );
}


export function isSwitchGuardFunction(maybeSwitch: Switch) {
  const expectedParameters = ["deviceType", "name", "commandOn", "commandOff"];
  function checkIfNotExceededParams() {
    for (const key in maybeSwitch) {
      if (!expectedParameters.includes(key)) {
        return false;
      }
    }
    return true;
  }

  function checkIfNotMissingParams() {
    for (const param of expectedParameters) {
      if (!maybeSwitch.hasOwnProperty(param)) {
        return false;
      }
    }
    return true;
  }

  return (
    checkIfNotExceededParams() &&
    checkIfNotMissingParams() &&
    typeof maybeSwitch.name === "string" &&
    typeof maybeSwitch.commandOn === "string" &&
    typeof maybeSwitch.commandOff === "string"
  );
}

export function runSwitchGuardFunction(reqBody: RunSwitchRequestBody) {
  const expectedParameters = ["switchOn"];
  function checkIfNotExceededParams() {
    for (const key in reqBody) {
      if (!expectedParameters.includes(key)) {
        return false;
      }
    }
    return true;
  }

  function checkIfNotMissingParams() {
    for (const param of expectedParameters) {
      if (!reqBody.hasOwnProperty(param)) {
        return false;
      }
    }
    return true;
  }

  return (
    checkIfNotExceededParams() &&
    checkIfNotMissingParams() &&
    typeof reqBody.switchOn === "boolean"
  );
}