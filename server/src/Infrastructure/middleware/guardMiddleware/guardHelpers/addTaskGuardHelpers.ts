import { ScheduleTime, Task } from "../../../../domain/Task";
import {
  checkIfNotExceededParams,
  checkIfNotMissingParams,
} from "./guardFunctionHelpers";

export function isTask(maybeTask: Task): boolean {
  const expectedParameters = ["deviceId", "onStatus", "scheduledTime"];

  return (
    checkIfNotExceededParams(maybeTask, expectedParameters) &&
    checkIfNotMissingParams(maybeTask, expectedParameters) &&
    isScheduledTime(maybeTask.scheduledTime) &&
    typeof maybeTask.deviceId === "string" &&
    typeof maybeTask.onStatus === "boolean"
  );
}

export function isScheduledTime(maybeScheduledTime: ScheduleTime) {
  const expectedParameters = ["hour", "minutes"];

  return (
    checkIfNotExceededParams(maybeScheduledTime, expectedParameters) &&
    checkIfNotMissingParams(maybeScheduledTime, expectedParameters) &&
    typeof maybeScheduledTime.hour === "string" &&
    typeof maybeScheduledTime.minutes === "string"
  );
}
