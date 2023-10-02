import { Device } from "./Device";

export class DeviceMapManager {
  private _devices: Map<string, Device>;
  constructor() {
    this._devices = new Map<string, Device>();
  }

  addDevice(device: Device) {
    this._devices.set(device.id, device);
  }

  get devices(): Map<string, Device> {
    return this._devices;
  }
}
