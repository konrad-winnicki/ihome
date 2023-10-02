export class ScheduleTime {
  readonly hour:string;
  readonly minutes: string;
  constructor(hour: string, minutes: string) {
    const parsedHour = parseFloat(hour)
    const parsedMinutes = parseFloat(minutes)
    if (isNaN(parsedHour) || isNaN(parsedMinutes)) {
      throw new Error("Hour and minutes must be numbers");
    }
    if (parsedHour % 1 !== 0 || parsedMinutes % 1 !== 0) {
      throw new Error("Hour and minutes must be integers");
    }

    if (parsedHour >= 0 && parsedHour <= 23 && parsedMinutes >= 0 && parsedMinutes <=59) {
      this.hour = hour;
      this.minutes = minutes;
    } else {
      throw new Error("Wrong format of time");
    }
  }
}

export class Task {
  readonly id: string;
  readonly deviceId: string;
  readonly onStatus: boolean
  readonly scheduledTime: ScheduleTime;

  constructor(
    id: string,
    deviceId: string,
    onStatus:boolean,
    scheduledTime: ScheduleTime
  ) {
    this.id = id;
    this.deviceId = deviceId;
    this.onStatus = onStatus;
    this.scheduledTime = new ScheduleTime(scheduledTime.hour, scheduledTime.minutes);
  }
 
}
