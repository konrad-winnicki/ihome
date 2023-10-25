import { Device } from "./Device";

export class InMemoryDeviceStorage {
  private static instance: InMemoryDeviceStorage | null = null;
  private _devices: Map<string, Device>;
  private constructor() {
    this._devices = new Map<string, Device>();
  }

  public static getInstance() {
    if (!InMemoryDeviceStorage.instance) {
      InMemoryDeviceStorage.instance = new InMemoryDeviceStorage();
    }
    return InMemoryDeviceStorage.instance;
  }

  public add(device: Device) {
    this._devices.set(device.id, device);
  }

  public delete(deviceId: string) {
    this._devices.delete(deviceId);
  }

  get devices(): Map<string, Device> {
    return this._devices;
  }
}
