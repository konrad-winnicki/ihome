import {
  checkIfNotExceededParams,
  checkIfNotMissingParams,
} from "./guardFunctionHelpers";


export type RunSwitchRequestBody = {
  onStatus: boolean;
};
export function isRunSwitch(reqBody: RunSwitchRequestBody): boolean {
  const expectedParameters = ["onStatus"];

  return (
    checkIfNotExceededParams(reqBody, expectedParameters) &&
    checkIfNotMissingParams(reqBody, expectedParameters) &&
    typeof reqBody.onStatus === "boolean"
  );
}
