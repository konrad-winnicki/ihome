import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";
import {
  deviceDocumentWithMockMetods,
  prepareMongoDeviceRepositoryWithMockPerameters,
} from "./mockForMongoDevicePersistence";

describe("MongoDeviceReposiotory CLASS TEST - add device", () => {
  const deviceToAdd = {
    id: "12345",
    deviceType: "switch",
    name: "switch1",
    commandOn: "switch on",
  };

  test("Should add device database", async () => {
    const addToDBStatus = "success";

    const deviceDokumentMock = deviceDocumentWithMockMetods(addToDBStatus);

    const mongoDeviceRepository =
      prepareMongoDeviceRepositoryWithMockPerameters(deviceDokumentMock);

    await mongoDeviceRepository
      .add(deviceToAdd)
      .then((result) => expect(result).toEqual({ deviceId: "12345" }));
  });

  [
    {
      description: "name already exists",
      parameter: { addToDBStatus: "DuplicationError" },
      result: {
        "Device not added": {
          error: "Unique violation error: NameConflictError",
        },
      },
    },
    {
      description: "id duplicated",
      parameter: { addToDBStatus: "DuplicatedId" },
      result: { "Device not added": { error: "Duplicated id" } },
    },
    {
      description: "internal Mongo Server Error",
      parameter: { addToDBStatus: "MongoServerError" },
      result: { "Device not added": { error: "MongoServerError" } },
    },
    {
      description: "internal Mongo Error",
      parameter: { addToDBStatus: "MongoError" },
      result: { "Device not added": { error: "Mongo Error" } },
    },
  ].forEach(({ description, parameter, result }) => {
    it(`Shoud not add device if ${description}`, async () => {
      const deviceDokumentMock = deviceDocumentWithMockMetods(
        parameter.addToDBStatus
      );

      const mongoDeviceManager =
        prepareMongoDeviceRepositoryWithMockPerameters(deviceDokumentMock);

      await mongoDeviceManager
        .add(deviceToAdd)
        .catch((err) => expect(err).toEqual(result));
    });
  });
});
