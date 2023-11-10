import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";
import {
  AddToDatabaseStatus,
  DeleteFromDBStatus,
  FindOneById,
  deviceDocumentWithMockMetods,
  prepareMongoDeviceRepositoryWithMockPerameters,
} from "./mockForMongoDevicePersistence";

describe("MongoDeviceReposiotory CLASS TEST - delete device", () => {
  
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
  
  test("Should delete device from database", async () => {
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";
    const findOneByIdStatus = undefined;

    const mongoDeviceRepository = prepareMongoDeviceRepository(
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus
    );

  
    await mongoDeviceRepository
      .delete("12345")
      .then((result) =>
        expect(result).toEqual({ "Device deleted": "No errors" })
      );
  });

  test("Should not delete device from database if error", async () => {
    const addToDBStatus = "success";
    const deleteFromDBStatus = "error";
    const findOneByIdStatus = undefined;

    const mongoDeviceRepository = prepareMongoDeviceRepository(
      addToDBStatus,
      deleteFromDBStatus,
      findOneByIdStatus
    )

    await mongoDeviceRepository.delete("12345").catch((result) =>
      expect(result).toEqual({
        "Device not deleted": "NOT deleted from database",
      })
    );
  });
});
