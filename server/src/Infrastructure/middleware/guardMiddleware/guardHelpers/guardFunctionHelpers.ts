export function checkIfNotExceededParams(
  object: object,
  expectedParameters: string[]
) {
  for (const key in object) {
    if (!expectedParameters.includes(key)) {
      return false;
    }
  }
  return true;
}

export function checkIfNotMissingParams(
  object: object,
  expectedParameters: string[]
) {
  for (const param of expectedParameters) {
    if (!Object.prototype.hasOwnProperty.call(object, param)) {
      return false;
    }
  }

  return true;
}
