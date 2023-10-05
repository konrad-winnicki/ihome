import { Device } from "./Device";



export class DeviceInMemory {
  private static instance: DeviceInMemory | null = null;
  private _devices: Map<string, Device>;
  private constructor() {
    this._devices = new Map<string, Device>();

  }

  public static getInstance(){
    if(!DeviceInMemory.instance){
      DeviceInMemory.instance = new DeviceInMemory()
    }

    return DeviceInMemory.instance
  }

  public addDevice(device: Device) {
    this._devices.set(device.id, device);
  }

  public deleteDevice(deviceId: string) {
    this._devices.delete(deviceId);
  }

  get devices(): Map<string, Device> {
    return this._devices;
  }
}



