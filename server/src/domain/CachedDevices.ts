import { Device } from "./Device";
import { Switch } from "./Switch";

export class CachedDevice {
  private static instance: CachedDevice | null = null;
  private _devices: Map<string, Device>;
  private constructor() {
    this._devices = new Map<string, Device>();
  }

  public static getInstance() {
    if (!CachedDevice.instance) {
      CachedDevice.instance = new CachedDevice();
    }
    return CachedDevice.instance;
  }

  public add(device: Device) {
    this._devices.set(device.id, device);
  }

  public delete(id: string) {
    this._devices.delete(id);
  }

  public changeStatus(id: string, onStatus: boolean) {
    const device = this._devices.get(id);
    if (device && device.deviceType === "switch") {
      (device as Switch).onStatus = onStatus;
    }
  }

  get devices(): Map<string, Device> {
    return this._devices;
  }
}
