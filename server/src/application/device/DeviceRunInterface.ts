export interface DeviceRunInterface {
  switchOn: (deviceId: string) => Promise<string>;
  switchOff: (deviceId: string) => Promise<string>;
}
