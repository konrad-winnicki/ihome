import { describe, test, expect } from "@jest/globals";
import { ScheduleTime } from "../../domain/Task";

describe("ScheduleTime class test", () => {
  test("ScheduleTime accepts hour number between 0-23", () => {
    const scheduleTime_0 = new ScheduleTime("0", "10");
    const scheduleTime_10 = new ScheduleTime("10", "10");
    const scheduleTime_23 = new ScheduleTime("23", "10");

    expect(scheduleTime_0.hour).toEqual("0");
    expect(scheduleTime_10.hour).toEqual("10");
    expect(scheduleTime_23.hour).toEqual("23");
  });

  test("ScheduleTime accepts minutes number between 0-59", () => {
    const scheduleTime_0 = new ScheduleTime("10", "0");
    const scheduleTime_10 = new ScheduleTime("10", "10");
    const scheduleTime_59 = new ScheduleTime("10", "59");

    expect(scheduleTime_0.minutes).toEqual("0");
    expect(scheduleTime_10.minutes).toEqual("10");
    expect(scheduleTime_59.minutes).toEqual("59");
  });

  test("Throw error if not valid hour or minutes.", () => {
    expect(() => new ScheduleTime("24", "0")).toThrow(
      "Hours string must be in range 0-23 and minutes 0-59"
    );

    expect(() => new ScheduleTime("10", "60")).toThrow(
      "Hours string must be in range 0-23 and minutes 0-59"
    );

    

   
  });

  test("Throw error if strings not contian only digits", () => {
    
    expect(() => new ScheduleTime('-10', '10')).toThrow(
      "Strings must contain only digits"
    );
    expect(() => new ScheduleTime('10', '-10')).toThrow(
      "Strings must contain only digits"
    );
    
    expect(() => new ScheduleTime('Ben', '10')).toThrow(
      "Strings must contain only digits"
    );
   
    expect(() => new ScheduleTime('10', 'Ben')).toThrow(
      "Strings must contain only digits"
    );

    expect(() => new ScheduleTime("Ben10", "0")).toThrow(
      "Strings must contain only digits"

    );

    expect(() => new ScheduleTime('10', '10Ben')).toThrow(
      "Strings must contain only digits"
    );
 
   

    expect(() => new ScheduleTime('10.10', '10')).toThrow(
      "Strings must contain only digits"
    );
    

    expect(() => new ScheduleTime('10', '10.5')).toThrow(
      "Strings must contain only digits"
    );


  });
});
