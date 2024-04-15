import { DeviceService } from "../application/device/DeviceService";
import { CommandExecutor } from "../Infrastructure/command/CommandExecutor";

export async function switchOffAllDevicesAfterServerStart(
  deviceService: DeviceService
) {
  const devices = await deviceService.getSwitchList();
  const switchPerformer = CommandExecutor.getInstance();
  const switchingResults = [];
  for (const device of devices) {
    const result = await switchPerformer
      .switchOff(device)
      .then(() => {
        return Promise.resolve({
          [device.id]: "Item switched off during server restart",
        });
      })
      .catch(() => {
        const message = {
          [`Switch ${device.id}`]:
            "Error occured during switching off after server restart",
        };
        return Promise.resolve(message);
      });

    switchingResults.push(result);
  }

  return switchingResults;
}
