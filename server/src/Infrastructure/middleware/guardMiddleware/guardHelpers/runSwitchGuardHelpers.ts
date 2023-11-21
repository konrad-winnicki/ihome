import {
  checkIfNotExceededParams,
  checkIfNotMissingParams,
} from "./guardFunctionHelpers";

export type RunDeviceRequestBody = {
  onStatus: boolean;
};
export function isRunDevice(reqBody: RunDeviceRequestBody): boolean {
  const expectedParameters = ["onStatus"];

  return (
    checkIfNotExceededParams(reqBody, expectedParameters) &&
    checkIfNotMissingParams(reqBody, expectedParameters) &&
    typeof reqBody.onStatus === "boolean"
  );
}
