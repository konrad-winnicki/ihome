import { RunSwitchRequestBody } from "../../../../controllers/runDevices/runSwitch";
import {
  checkIfNotExceededParams,
  checkIfNotMissingParams,
} from "./guardFunctionHelpers";

export function isRunSwitch(reqBody: RunSwitchRequestBody): boolean {
  const expectedParameters = ["switchOn"];

  return (
    checkIfNotExceededParams(reqBody, expectedParameters) &&
    checkIfNotMissingParams(reqBody, expectedParameters) &&
    typeof reqBody.switchOn === "boolean"
  );
}
