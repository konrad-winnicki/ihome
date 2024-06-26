import { CacheDeviceRepository } from "../../application/device/CacheDeviceRepository";
import { ServerMessages } from "../../infrastructure/ServerMessages";
import { DeviceRepository } from "../../application/device/DeviceRepositoryInterface";
import { Device } from "../../domain/Device";
import { CachedDevice } from "../../infrastructure/cache/CachedDevice";

export function prepareCacheDeviceRepositoryWithMockPerameters(
  inMemoryStorage: CachedDevice,
  deviceRepository: DeviceRepository
) {
  const serverMessages = new ServerMessages();
  const cacheDeviceRepository = new CacheDeviceRepository(
    inMemoryStorage,
    deviceRepository,
    serverMessages
  );

  return cacheDeviceRepository;
}

export type MemeoryStatusType = "success" | "error";

export function inMemoryStoreWithMockMethods(
  addToMemoryStatus: MemeoryStatusType,
  deleteFromMemoryStatus: MemeoryStatusType
) {
  const inMemoryStorageMock = CachedDevice.getInstance();

  const mockAddDeviceToStorage = jest
    .fn()
    .mockImplementation((device: Device) => {
      switch (addToMemoryStatus) {
        case "success":
          inMemoryStorageMock.devices.set(device.id, device);
          break;
        case "error":
          throw new Error("Adding to storage failed");
      }
    });

  const mockDeleteDeviceFromStorage = jest.fn().mockImplementation(() => {
    switch (deleteFromMemoryStatus) {
      case "success":
        return Promise.resolve("Deleted from storage");
      case "error":
        throw new Error("Deletion from storage failed");
    }
  });

  inMemoryStorageMock.add = mockAddDeviceToStorage;
  inMemoryStorageMock.delete = mockDeleteDeviceFromStorage;

  return inMemoryStorageMock;
}
