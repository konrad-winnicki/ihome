export class Task {
  readonly id: string;
  readonly deviceId: string;
  readonly onStatus: boolean;
  readonly scheduledTime: ScheduleTime;

  constructor(
    id: string,
    deviceId: string,
    onStatus: boolean,
    scheduledTime: ScheduleTime
  ) {
    this.id = id;
    this.deviceId = deviceId;
    this.onStatus = onStatus;
    this.scheduledTime = new ScheduleTime(
      scheduledTime.hour,
      scheduledTime.minutes
    );
  }
}

export class ScheduleTime {
  readonly hour: string;
  readonly minutes: string;
  constructor(hour: string, minutes: string) {
    const digitRegExp = /^[0-9]+$/;
    const parsedHour = parseFloat(hour);
    const parsedMinutes = parseFloat(minutes);
    if (!digitRegExp.test(hour) || !digitRegExp.test(minutes)) {
      throw new Error("Strings must contain only digits");
    }

    if (
      parsedHour >= 0 &&
      parsedHour <= 23 &&
      parsedMinutes >= 0 &&
      parsedMinutes <= 59
    ) {
      this.hour = hour;
      this.minutes = minutes;
    } else {
      throw new Error("Hours string must be in range 0-23 and minutes 0-59");
    }
  }
}
