import { deviceService, devicesInMemory, taskService } from "../dependencias";
import { Meter } from "./Meter";
import { Switch } from "./Switch";

export  function fillDeviceInMemoryWithData() {
  const meters = deviceService.getMeterList();
  const switches = deviceService.getSwitchList();

  Promise.all([meters, switches])
    .then((promises) => {
      const [meters, switches] = promises;
      meters.forEach((meter: Meter) => {
        devicesInMemory.addDevice(meter);
      });
      switches.forEach((switchDevice: Switch) => {
        devicesInMemory.addDevice(switchDevice);
      });
    })
    .catch((error) => console.log(error));
}

export function fillCronInMemoryWithData() {
  taskService
    .transformTaskFromDbToCron()
    .then((result:string) => console.log(result))
    .catch((error:string) => console.log(error));
  //TODO: what when server restart but this fails?
}
