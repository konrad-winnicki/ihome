import { Device } from "../../domain/Device";
import { DeviceRepository } from "../../application/device/DeviceRepositoryInterface";
import { ServerMessages } from "../ServerMessages";
import { ManagerResponse } from "../../application/task/TaskManagerInterface";
import { FileRepositoryHelpers } from "./auxilaryFunctions";

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
      .readDataFromFile("devices.json")
      .then((fileContent) => {
        const isDeviceExisting = this.helperMethods.findByIdInFile(
          fileContent,
          device.id
        );
        if (isDeviceExisting) {
          throw new Error(this.serverMessages.uniqueViolation.ID_DUPLICATION);
        }
        const isNameExisting = this.helperMethods.findIfDeviceNameExists(
          fileContent as { [key: string]: Device },
          device.name
        );
        if (isNameExisting) {
          return Promise.reject({
            error: this.serverMessages.uniqueViolation.NAME_DUPLICATION,
          });
        }
        fileContent[device.id] = device;
        return this.helperMethods
          .writeDataToFile("devices.json", fileContent)
          .then(() => {
            const messageSuccess = this.serverMessages.addDevice.SUCCESS;
            const resolveMessage = { [messageSuccess]: device.id };
            return Promise.resolve(resolveMessage);
          })
          .catch((c) => {
            return Promise.reject(c);
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
      .readDataFromFile("devices.json")
      .then((fileContent) => {
        const isExisting = this.helperMethods.findByIdInFile(fileContent, id);
        if (!isExisting) {
          throw new Error(`Device ${id} does not exists.`);
        }
        delete fileContent[id];
        return this.helperMethods
          .writeDataToFile("devices.json", fileContent)
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
    const persistencieError = this.serverMessages.persistenceError;

    return this.helperMethods
      .readDataFromFile("devices.json")
      .then((fileContent) => {
        const devices = Object.values(fileContent) as Device[];
        const typedDevices = devices.filter((device) => {
          if (device.deviceType === deviceType) {
            return device;
          }
        });
        return Promise.resolve(typedDevices);
      })
      .catch((error) => Promise.reject({ [persistencieError]: error }));
  }

  async getById(deviceId: string): Promise<Device> {
    const persistenceError = this.serverMessages.persistenceError;

    return this.helperMethods
      .readDataFromFile("devices.json")
      .then((fileContent) => {
        const device = this.helperMethods.findByIdInFile(fileContent, deviceId);
        return device
          ? Promise.resolve(device as Device)
          : Promise.reject({
              NonExistsError: `Device with id ${deviceId} does not exist.`,
            });
      })
      .catch((error) => Promise.reject({ [persistenceError]: error }));
  }
}
