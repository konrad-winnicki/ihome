import { Sensor } from "../../domain/Sensor";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
import { EventEmitter } from "node:events";
import { ManagerResponse } from "../task/TaskManager";
import { DeviceRepository } from "./DeviceRepository";

export class DeviceService {
  private deviceRepository: DeviceRepository;
  private eventEmitter: EventEmitter;

  constructor(deviceRepository: DeviceRepository, eventEmitter: EventEmitter) {
    this.deviceRepository = deviceRepository;
    this.eventEmitter = eventEmitter;
  }

  async addDevice(device: Device): Promise<ManagerResponse<object | string>> {
    return this.deviceRepository.add(device);
  }

  async deleteDevice(
    deviceId: string
  ): Promise<ManagerResponse<object | string>> {
    return this.deviceRepository.delete(deviceId).then((response) => {
      this.eventEmitter.emit("deviceDeleted", deviceId);
      return Promise.resolve(response);
    });
  }

  async getSensorList(): Promise<Sensor[]> {
    return this.deviceRepository
      .listByType("sensor")
      .then((devices) => {
        const meters = devices as unknown as Sensor[];
        return Promise.resolve(meters);
      })
      .catch((err) =>
        Promise.reject(`Getting meter list failed due error: ${err}`)
      );
  }

  async getSwitchList(): Promise<Switch[]> {
    return this.deviceRepository
      .listByType("switch")
      .then((devices) => {
        const switches = devices as unknown as Switch[];
        return Promise.resolve(switches);
      })
      .catch((err) =>
        Promise.reject(`Getting meter list failed due error: ${err}`)
      );
  }

  async getById(deviceId: string): Promise<Device> {
    return this.deviceRepository.getById(deviceId);
    /*
      .then((device) =>
        device
          ? Promise.resolve(device)
          : Promise.reject({
              Error: `Device with id ${deviceId} does not exist.`,
            })
      )
      .catch((error) => Promise.reject(error));
      */
  }
}
