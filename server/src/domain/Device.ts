export class Device {
  readonly id: string;
  readonly deviceType: string;
  readonly name: string;
  readonly commandOn: string;

  constructor(id: string, deviceType: string, name: string, commandOn: string) {
    this.id = id;
    this.deviceType = deviceType;
    this.name = name;
    this.commandOn = commandOn;
  }
}
