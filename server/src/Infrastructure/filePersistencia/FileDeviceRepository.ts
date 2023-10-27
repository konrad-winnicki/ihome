import { Device } from "../../domain/Device";
import { DeviceRepository } from "../../application/device/DeviceRepository";
import { ServerMessages } from "../../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManager";
import { FileRepositoryHelpers } from "./auxilaryFunctions";

//interface devicePersistence: adddevuce, deleteDevice, getMenager, Getswitch
//mongo lub file impelement devicePersistence intrtface

export class FileDeviceRepository implements DeviceRepository {
  private helperMethods: FileRepositoryHelpers;
  private serverMessages: ServerMessages;

  constructor(
    helperMethods: FileRepositoryHelpers,
    serverMessages: ServerMessages
  ) {
    this.helperMethods = helperMethods;
    this.serverMessages = serverMessages;
  }

  async add(device: Device): Promise<ManagerResponse<object | string>> {
    return this.helperMethods
      .readFile("devices.json")
      .then((fileContent) => {
        const isDeviceExisting = this.helperMethods.findById(
          fileContent,
          device.id
        );
        if (isDeviceExisting) {
          throw new Error(this.serverMessages.uniqueViolation.ID_DUPLICATION);
        }
        const isNameExisting = this.helperMethods.findIfNameExists(
          fileContent,
          device.name
        );
        if (isNameExisting) {
          throw new Error(this.serverMessages.uniqueViolation.NAME_DUPLICATION);
        }
        fileContent[device.id] = device;
        return this.helperMethods
          .writeFile("devices.json", fileContent)
          .then(() => {
            console.log('alllla')
            const messageSuccess = this.serverMessages.addDevice.SUCCESS;
            const resolveMessage = { [messageSuccess]: device.id };
            return Promise.resolve(resolveMessage);
          });
      })
      .catch((error) => {
        const messageFailure = this.serverMessages.addDevice.FAILURE;
        if (error instanceof Error) {
          return Promise.reject({ [messageFailure]: error.message });
        }
        return Promise.reject({ [messageFailure]: error });
      });
  }

  async delete(id: string): Promise<ManagerResponse<string>> {
    return this.helperMethods
      .readFile("devices.json")
      .then((fileContent) => {
        const isExisting = this.helperMethods.findById(fileContent, id);
        if (!isExisting) {
          throw new Error(`Device ${id} does not exists.`);
        }
        delete fileContent[id];

        return this.helperMethods
          .writeFile("devices.json", fileContent)
          .then(() => {
            const messageSuccess = this.serverMessages.deleteDevice.SUCCESS;
            const resolveMessage = { [messageSuccess]: "No errors" };
            return Promise.resolve(resolveMessage);
          });
      })
      .catch((error) => {
        const messageFailure = this.serverMessages.addDevice.FAILURE;
        if (error instanceof Error) {
          return Promise.reject({ [messageFailure]: error.message });
        }
        return Promise.reject({ [messageFailure]: error });
      });
  }

  async listByType(deviceType: string): Promise<Device[]> {
    return this.helperMethods.readFile("devices.json").then((fileContent) => {
      const devices = Object.values(fileContent) as Device[];
      const typedDevices = devices.filter((device) => {
        if (device.deviceType === deviceType) {
          return device;
        }
      });
      return Promise.resolve(typedDevices);
    });
  }

  async getById(deviceId: string): Promise<Device> {
    return this.helperMethods.readFile("devices.json").then((fileContent) => {
      const device = this.helperMethods.findById(fileContent, deviceId);
      return device
        ? Promise.resolve(device as Device)
        : Promise.reject({
            NonExistsError: `Device with id ${deviceId} does not exist.`,
          });
    });
  }
}