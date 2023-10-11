import { deviceService, devicesInMemory, taskService } from "../dependencias"
import { Meter } from "./Meter";
import { Switch } from "./Switch";

export async function fillDeviceInMemoryWithData() {
  const meters = await deviceService.getMeterList();
  const switches = await deviceService.getSwitchList();
  meters.forEach((meter: Meter) => {
    devicesInMemory.addDevice(meter);
  });
  switches.forEach((switchDevice: Switch) => {
    devicesInMemory.addDevice(switchDevice);
  });
}

export async function fillCronInMemoryWithData() {
  taskService.transformTaskFromDbToCron();
  //TODO: what when server restart but this fails?
}
