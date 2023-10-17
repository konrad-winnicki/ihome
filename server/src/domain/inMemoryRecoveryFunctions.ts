import { MongoDeviceManager } from "../Infrastructure/device/MongoDeviceManager";
import { TaskService } from "../application/task/TaskService";
import { InMemoryDeviceStorage } from "./InMemoryDeviceStorage";
import { Meter } from "./Meter";
import { Switch } from "./Switch";



export async function recoveryInMemoryDeviceStorage(
  deviceService: MongoDeviceManager,
  devicesInMemory: InMemoryDeviceStorage
) {
  const meters = await deviceService.getMeterList();
  const switches = await deviceService.getSwitchList();

  return Promise.all([meters, switches])
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


export async function fillCronInMemoryWithData(taskService:TaskService) {
   return taskService
    .transformTaskFromDbToCron()
    .then((result: string) => console.log(result))
    .catch((error: string) => console.log(error));
  //TODO: what when server restart but this fails?
  
}
