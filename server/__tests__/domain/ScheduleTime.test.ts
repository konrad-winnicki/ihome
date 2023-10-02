import { describe, test, expect } from "@jest/globals";
import { ScheduleTime } from "../../src/domain/Task";

describe("ScheduleTime class test", () => {
  test("ScheduleTime accepts hour number between 0-23", () => {
    const scheduleTime_0 = new ScheduleTime('0', '10');
    const scheduleTime_10 = new ScheduleTime('10', '10');
    const scheduleTime_23 = new ScheduleTime('23', '10');

    expect(scheduleTime_0.hour).toEqual('0');
    expect(scheduleTime_10.hour).toEqual('10');
    expect(scheduleTime_23.hour).toEqual('23');
  });

  test("ScheduleTime accepts minutes number between 0-59", () => {
    const scheduleTime_0 = new ScheduleTime('10', '0');
    const scheduleTime_10 = new ScheduleTime('10', '10');
    const scheduleTime_59 = new ScheduleTime('10', '59');

    expect(scheduleTime_0.minutes).toEqual('0');
    expect(scheduleTime_10.minutes).toEqual('10');
    expect(scheduleTime_59.minutes).toEqual('59');
  });

  test("Throw error if hour or minutes are not numbers", () => {
    expect(() => new ScheduleTime('10.1', '0')).toThrow(
      "Hour and minutes must be integers"
    );
    expect(() => new ScheduleTime('10', '10.15')).toThrow(
      "Hour and minutes must be integers"
    );
  });
});
