import { Model } from "mongoose";
import { Device } from "../../domain/Device";
import { Task } from "../../domain/Task";
import { CustomMongoServerError } from "./mockForMongoDevicePersistence";



export function taskDocumentWithMockMetods(
  addToDBStatus: string,
  deleteFromDBStatus: string,
  deleteFromDBOptions: object,
  aggregateStatus?: string,
  findOneByIdStatus?: string | null
) {
  const databaseCreateMock = jest.fn().mockImplementation((device: Device) => {
    switch (addToDBStatus) {
      case "success":
        return Promise.resolve(device);
        case "duplicatedId":
          return Promise.reject(
            new CustomMongoServerError(11000, { errmsg: "Duplicated id" })
          );
      case "error":
        return Promise.reject("Adding to database failed");
    }
  });

  const databaseDeleteOneMock = jest.fn().mockImplementation(() => {
    console.log("delete from db", deleteFromDBStatus);

    switch (deleteFromDBStatus) {
      case "success":
        return Promise.resolve(deleteFromDBOptions);
      case "error":
        return Promise.reject(
          "NOT deleted from database. Internal database error."
        );
    }
  });

  const aggregateMock = jest.fn().mockImplementation(() => {
    switch (aggregateStatus) {
      case "success":
        return Promise.resolve([
          {
            id: "678910",
            onStatus: true,
            scheduledTime: { hour: 10, minutes: 56 },
            device: { commandOn: "switch on", commandOff: "switch off" },
          },
        ]);
      case "internalError":
        return Promise.reject("Error during aggregation");
      case "emptyArray":
        return Promise.resolve([]);
    }
  });

  const databaseFindOneMock = jest.fn().mockImplementation(() => {
    switch (findOneByIdStatus) {
      case "success":
        return Promise.resolve({
          id: "678910",
          onStatus: true,
          scheduledTime: { hour: "10", minutes: "56" },
          device: { commandOn: "switch on", commandOff: "switch off" },
        });
      case "error":
        return Promise.reject("Internal database error");

      case null:
        return Promise.reject(`Task not exists`);
    }
  });
  const taskDokumentMock = {
    create: databaseCreateMock,
    deleteOne: databaseDeleteOneMock,
    aggregate: aggregateMock,
    findOne: databaseFindOneMock,
  } as unknown as Model<Task>;

  return taskDokumentMock;
}


