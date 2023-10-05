export class ScheduleTime {
  readonly hour:string;
  readonly minutes: string;
  constructor(hour: string, minutes: string) {
    const parsedHour = parseFloat(hour)
    const parsedMinutes = parseFloat(minutes)
    if (isNaN(parsedHour) || isNaN(parsedMinutes)) {
      throw new Error("Strings must contain only digits");
    }
    if (parsedHour % 1 !== 0 || parsedMinutes % 1 !== 0) {
      throw new Error("Strings must be convertable to integers");
    }

    if (parsedHour >= 0 && parsedHour <= 23 && parsedMinutes >= 0 && parsedMinutes <=59) {
      this.hour = hour;
      this.minutes = minutes;
    } else {
      throw new Error("Hours must be in range 0-23 and minutes 0-59");
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
