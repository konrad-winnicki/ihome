import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";
import {
  AddToDatabaseStatus,
  DeleteFromDBStatus,
  FindOneById,
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

  const prepareMongoDeviceRepository = (
    addToDBStatus: AddToDatabaseStatus,
    deleteFromDBStatus: DeleteFromDBStatus,
    findOneByIdStatus: FindOneById
  ) => {
    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus
    );

    return prepareMongoDeviceRepositoryWithMockPerameters(deviceDokumentMock);
  };

  test("Should add device database", async () => {
    const addToDBStatus = "success";
    const deleteFromDBStatus = undefined;
    const findOneByIdStatus = undefined;

    const mongoDeviceRepository = prepareMongoDeviceRepository(
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus
    );

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
      const addToDBStatus = parameter.addToDBStatus as AddToDatabaseStatus;
      const deleteFromDBStatus = undefined;
      const findOneByIdStatus = undefined;

      const mongoDeviceRepository = prepareMongoDeviceRepository(
        addToDBStatus,
        deleteFromDBStatus,
        findOneByIdStatus
      );

      await mongoDeviceRepository
        .add(deviceToAdd)
        .catch((err) => expect(err).toEqual(result));
    });
  });
});
