import { Device } from "./Device";

export class Switch extends Device {
  readonly commandOff: string;
  public onStatus: boolean;


  constructor(
    id: string,
    deviceType: string,
    name: string,
    commandOn: string,
    commandOff: string,
  ) {
    super(id, deviceType, name, commandOn);
    this.commandOff = commandOff;
    this.onStatus = false
  }
}
