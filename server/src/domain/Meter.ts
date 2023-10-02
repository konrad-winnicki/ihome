import { Device} from "./Device";


export interface MeterParameters {
       [key: string]: string;
   }


export class Meter extends Device {
  readonly parameters :MeterParameters
  constructor(
    id: string,
    deviceType: string,
    name: string,
    parameters :MeterParameters,
    commandOn: string,
  ) {
    super(id, deviceType, name, commandOn);
    this.parameters = parameters
  }
}
