import { Device } from "./Device";

export interface ParametersWithUnits {
  [key: string]: string;
}

export class Sensor extends Device {
  readonly parameters: ParametersWithUnits;
  constructor(
    id: string,
    deviceType: string,
    name: string,
    parameters: ParametersWithUnits,
    commandOn: string
  ) {
    super(id, deviceType, name, commandOn);
    this.parameters = parameters;
  }
}
