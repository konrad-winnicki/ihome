import { Device} from "./Device";


export interface ParametersUnits {
       [key: string]: string;
   }


export class Meter extends Device {
  readonly parameters: ParametersUnits
  constructor(
    id: string,
    deviceType: string,
    name: string,
    parameters: ParametersUnits,
    commandOn: string,
  ) {
    super(id, deviceType, name, commandOn);
    this.parameters = parameters
  }
}
