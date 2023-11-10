
export class AggregatedTask {
    readonly id: string;
    readonly onStatus: boolean;
    readonly hour:number;
    readonly minutes:number;
    readonly commandOn:string;
    readonly commandOff:string|null;
    readonly deviceId: string

    constructor(
      id: string,
      onStatus:boolean,
      hour:number ,
      minutes:number,
      commandOn: string,
      commandOff:string|null,
      deviceId: string
    ) {
      this.id = id;
      this.onStatus = onStatus;
      this.hour = hour;
      this.minutes = minutes
      this.commandOn = commandOn
      this.commandOff = commandOff
      this.deviceId = deviceId
    }
   
  }