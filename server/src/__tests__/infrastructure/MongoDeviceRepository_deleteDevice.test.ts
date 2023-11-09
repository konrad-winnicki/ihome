import { describe } from "@jest/globals";
import { expect, test } from "@jest/globals";
import {
  deviceDocumentWithMockMetods,
  prepareMongoDeviceRepositoryWithMockPerameters,
} from "./mockForMongoDevicePersistence";

describe("MongoDeviceReposiotory CLASS TEST - delete device", () => {
  test("Should delete device from database", async () => {
    const addToDBStatus = "success";
    const deleteFromDBStatus = "success";

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceRepository =
      prepareMongoDeviceRepositoryWithMockPerameters(deviceDokumentMock);

    await mongoDeviceRepository
      .delete("12345")
      .then((result) =>
        expect(result).toEqual({ "Device deleted": "No errors" })
      );
  });

  test("Should not delete device from database if error", async () => {
    const addToDBStatus = "success";

    const deleteFromDBStatus = "error";

    const deviceDokumentMock = deviceDocumentWithMockMetods(
      addToDBStatus,
      deleteFromDBStatus
    );

    const mongoDeviceRepository =
      prepareMongoDeviceRepositoryWithMockPerameters(deviceDokumentMock);

    await mongoDeviceRepository.delete("12345").catch((result) =>
      expect(result).toEqual({
        "Device not deleted": "NOT deleted from database",
      })
    );
  });
});
