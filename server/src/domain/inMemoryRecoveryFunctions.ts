import { DeviceRunService } from "../application/device/DeviceRunService";
import { DeviceService } from "../application/device/DeviceService";
import { TaskRecovery } from "../application/task/TaskRecovery";
import { cachedDevice } from "./CachedDevices";
import { Meter } from "./Meter";
import { Switch } from "./Switch";

export async function recoveryInMemoryDeviceStorage(
  deviceService: DeviceService,
  devicesInMemory: cachedDevice,
  deviceRunService: DeviceRunService
) {
  const [meters, switches] = await getDevices(deviceService);

  meters.forEach((meter: Meter) => {
    devicesInMemory.add(meter);
  });

  //const switchOffResults = [];
  for (const switchDevice of switches) {
    devicesInMemory.add(switchDevice);

    //const result = await switchOffPerformer(deviceRunService, switchDevice);
    //switchOffResults.push(result);
  }

  /*
  const switchOffPromises = switches.reduce(
    async (accumulatorPromise, switchDevice) => {
      devicesInMemory.add(switchDevice);
      const accumulator = await accumulatorPromise;
      const switchOfFResult = await switchOffDevice(
        deviceRunService,
        switchDevice
      );
      accumulator.push(switchOfFResult);
      return accumulator;
    },
    Promise.resolve<object[]>([])
  );
  return switchOffPromises;
*/

  //return { "Devices added to memory": switchOffResults };
}

async function getDevices(deviceService: DeviceService) {
  const promiseWithMeters = deviceService.getMeterList();
  const promiseWithSwitches = deviceService.getSwitchList();

  return Promise.all([promiseWithMeters, promiseWithSwitches]);
}

async function switchOffPerformer(
  deviceRunService: DeviceRunService,
  switchDevice: Switch
) {
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
}

export async function fillCronInMemoryWithData(cronTaskManager: TaskRecovery) {
  return cronTaskManager
    .transformTaskFromDbToCron()
    .then((result) => console.log(result))
    .catch((error) => console.log(error));
  //TODO: what when server restart but this fails?
}
