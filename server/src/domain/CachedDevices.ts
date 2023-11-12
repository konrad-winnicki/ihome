import { Device } from "./Device";
import { Switch } from "./Switch";

export class cachedDevice {
  private static instance: cachedDevice | null = null;
  private _devices: Map<string, Device>;
  private constructor() {
    this._devices = new Map<string, Device>();
  }

  public static getInstance() {
    if (!cachedDevice.instance) {
      cachedDevice.instance = new cachedDevice();
    }
    return cachedDevice.instance;
  }

  public add(device: Device) {
    this._devices.set(device.id, device);
  }

  public delete(deviceId: string) {
    this._devices.delete(deviceId);
  }

  public changeStatus(deviceId: string, status:boolean) {
    const device = this._devices.get(deviceId)
    if (device && device.deviceType === "switch"){
      (device as Switch).onStatus = status
    }
  }

  get devices(): Map<string, Device> {
    return this._devices;
  }
}
