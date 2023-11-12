import { Device } from "./Device";

export class cachedDevice {
  private static instance: cachedDevice | null = null;
  private _devices: Map<string, {onState: boolean, device: Device}>;
  private constructor() {
    this._devices = new Map<string, {onState: boolean, device: Device}>();
  }

  public static getInstance() {
    if (!cachedDevice.instance) {
      cachedDevice.instance = new cachedDevice();
    }
    return cachedDevice.instance;
  }

  public add(device: Device) {
    this._devices.set(device.id, {onState: false, device: device});
  }

  public delete(deviceId: string) {
    this._devices.delete(deviceId);
  }

  get devices(): Map<string, {onState: boolean, device: Device}> {
    return this._devices;
  }
}
