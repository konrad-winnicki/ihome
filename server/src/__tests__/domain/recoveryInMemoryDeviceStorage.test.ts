import { describe, test, expect } from "@jest/globals";
import { Device } from "../../domain/Device";
import { InMemoryDeviceStorage } from "../../domain/InMemoryDeviceStorage";
import { Meter } from "../../domain/Meter";
import { Switch } from "../../domain/Switch";

describe("InMemoryDeviceStorage class test", () => {
  const device1 = new Device("d1", "device", "device1", "start_device_1");

  const device2 = new Device("d2", "device", "device2", "start_device_2");
  const meter1 = new Meter(
    "m1",
    "meter",
    "meter1",
    { temperature: "oC", humidity: "%" },
    "start_meter_1"
  );
  const meter2 = new Meter(
    "m2",
    "meter",
    "meter2",
    { temperature: "oC", humidity: "%" },
    "start_meter_2"
  );

  const switch1 = new Switch(
    "s1",
    "switch",
    "switch",
    "start_switch_1",
    "stop_switch_1"
  );

  const switch2 = new Switch(
    "s2",
    "switch",
    "switch",
    "start_switch_2",
    "stop_switch_2"
  );

  test("Should return class instance ", () => {
    const inMemoryDeviceStorage = InMemoryDeviceStorage.getInstance();
    expect(inMemoryDeviceStorage).toBeInstanceOf(InMemoryDeviceStorage);
  });

  test.each([
    {
      key: "d1",
      value: device1,
    },
    {
      key: "d2",
      value: device2,
    },
  ])("Should add device to storage", ({ key, value }) => {
    const inMemoryDeviceStorage = InMemoryDeviceStorage.getInstance();
    inMemoryDeviceStorage.add(value);
    const devices = inMemoryDeviceStorage.devices;

    expect(devices.has(key)).toBe(true);
    expect(devices.get(key)).toBe(value);
  });

  test.each([
    {
      key: "m1",
      value: meter1,
    },
    {
      key: "m2",
      value: meter2,
    },
  ])("Should add meter to storage", ({ key, value }) => {
    const inMemoryDeviceStorage = InMemoryDeviceStorage.getInstance();
    inMemoryDeviceStorage.add(value);
    const devices = inMemoryDeviceStorage.devices;

    expect(devices.has(key)).toBe(true);
    expect(devices.get(key)).toBe(value);
  });

  test.each([
    {
      key: "s1",
      value: switch1,
    },
    {
      key: "s2",
      value: switch2,
    },
  ])("Should add switch to storage", ({ key, value }) => {
    const inMemoryDeviceStorage = InMemoryDeviceStorage.getInstance();
    inMemoryDeviceStorage.add(value);
    const devices = inMemoryDeviceStorage.devices;

    expect(devices.has(key)).toBe(true);
    expect(devices.get(key)).toBe(value);
  });

  test("Should delete item from storage", () => {
    const inMemoryDeviceStorage = InMemoryDeviceStorage.getInstance();
    inMemoryDeviceStorage.add(meter1);
    inMemoryDeviceStorage.add(switch1);
    inMemoryDeviceStorage.delete("m1");
    const devices = inMemoryDeviceStorage.devices;

    expect(devices.has("m1")).toBe(false);
    expect(devices.get("mq")).toBe(undefined);
  });
});
