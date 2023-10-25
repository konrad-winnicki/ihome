import { DeviceService } from "../application/device/DeviceService";
import { TaskRecovery } from "../application/task/TaskRecovery";
import { InMemoryDeviceStorage } from "./InMemoryDeviceStorage";
import { Meter } from "./Meter";
import { Switch } from "./Switch";

export async function recoveryInMemoryDeviceStorage(
  deviceService: DeviceService,
  devicesInMemory: InMemoryDeviceStorage
) {
  const meters = await deviceService.getMeterList();
  const switches = await deviceService.getSwitchList();

  return Promise.all([meters, switches])
    .then((promises) => {
      const [meters, switches] = promises;
      meters.forEach((meter: Meter) => {
        devicesInMemory.add(meter);
      });
      switches.forEach((switchDevice: Switch) => {
        devicesInMemory.add(switchDevice);
      });
    })
    .catch((error) => console.log(error));
}

export async function fillCronInMemoryWithData(cronTaskManager: TaskRecovery) {
  return cronTaskManager
    .transformTaskFromDbToCron()
    .then((result) => console.log(result))
    .catch((error) => console.log(error));
  //TODO: what when server restart but this fails?
}
