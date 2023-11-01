import { Meter } from "../../domain/Meter";
import { Device } from "../../domain/Device";
import { Switch } from "../../domain/Switch";
import { EventEmitter } from "node:events";
import { ManagerResponse } from "../task/TaskManager";
import { DeviceRepository } from "./DeviceRepository";

//interface devicePersistence: adddevuce, deleteDevice, getMenager, Getswitch
//mongo lub file impelement devicePersistence intrtface

export class DeviceService {
  private persistenceDeviceRepository: DeviceRepository;
  private eventEmitter: EventEmitter;

  constructor(
    persistenceDeviceRepository: DeviceRepository,
    eventEmitter: EventEmitter
  ) {
    this.persistenceDeviceRepository = persistenceDeviceRepository;
    this.eventEmitter = eventEmitter;
  }

  async addDevice(device: Device): Promise<ManagerResponse<object | string>> {
    return this.persistenceDeviceRepository.add(device);
  }

  async deleteDevice(
    deviceId: string
  ): Promise<ManagerResponse<object | string>> {
    return this.persistenceDeviceRepository
      .delete(deviceId)
      .then((response) => {
        console.log(response);
        this.eventEmitter.emit("deviceDeleted", deviceId);
        return Promise.resolve(response);
      });
  }

  async getMeterList(): Promise<Meter[]> {
    return this.persistenceDeviceRepository
      .listByType("meter")
      .then((devices) => {
        const meters = devices as unknown as Meter[];
        return Promise.resolve(meters);
      })
      .catch((err) =>
        Promise.reject(`Getting meter list failed due error: ${err}`)
      );
  }

  async getSwitchList(): Promise<Switch[]> {
    return this.persistenceDeviceRepository
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
    return this.persistenceDeviceRepository.getById(deviceId);
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
