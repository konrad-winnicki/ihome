import {
  checkIfNotExceededParams,
  checkIfNotMissingParams,
} from "./guardFunctionHelpers";


export type RunSwitchRequestBody = {
  switchOn: boolean;
};
export function isRunSwitch(reqBody: RunSwitchRequestBody): boolean {
  const expectedParameters = ["switchOn"];

  return (
    checkIfNotExceededParams(reqBody, expectedParameters) &&
    checkIfNotMissingParams(reqBody, expectedParameters) &&
    typeof reqBody.switchOn === "boolean"
  );
}
