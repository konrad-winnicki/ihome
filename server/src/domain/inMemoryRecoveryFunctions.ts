import { DeviceRunService } from "../application/device/DeviceRunService";
import { DeviceService } from "../application/device/DeviceService";
import { TaskRecovery } from "../application/task/TaskRecovery";
import { InMemoryDeviceStorage } from "./InMemoryDeviceStorage";
import { Meter } from "./Meter";
import { Switch } from "./Switch";

export async function recoveryInMemoryDeviceStorage(
  deviceService: DeviceService,
  devicesInMemory: InMemoryDeviceStorage,
  deviceRunService: DeviceRunService
) {
  const meters = await deviceService.getMeterList();
  const switches = await deviceService.getSwitchList();

  return Promise.all([meters, switches]).then((promises) => {
    const [meters, switches] = promises;
    meters.forEach((meter: Meter) => {
      devicesInMemory.add(meter);
    });

    const switchOffPromises = switches.map((switchDevice: Switch) => {
      devicesInMemory.add(switchDevice);

      return deviceRunService
        .switchOff(switchDevice.id)
        .then(() => {
          return Promise.resolve({
            [switchDevice.id]: "Item switched off during server restart",
          });
        })
        .catch(() => {
          const message = {
            [`Switch ${switchDevice.id}`]:
              "Error occureed during switching off after server restart",
          };
          return Promise.reject(message);
        });
    });

    return Promise.all(switchOffPromises);
  });
}

export async function fillCronInMemoryWithData(cronTaskManager: TaskRecovery) {
  return cronTaskManager
    .transformTaskFromDbToCron()
    .then((result) => console.log(result))
    .catch((error) => console.log(error));
  //TODO: what when server restart but this fails?
}
