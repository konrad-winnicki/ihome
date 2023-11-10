import { Model } from "mongoose";
import { Device } from "../../domain/Device";
import { Task } from "../../domain/Task";
import {
  AddToDatabaseStatus,
  CustomMongoServerError,
  DeleteFromDBStatus,
  FindOneById,
} from "./mockForMongoDevicePersistence";

export type AggregateStatus = "success" | "internalError" | "emptyArray" | undefined;
export type DeleteFromDBOptions = {
  acknowledged: boolean;
  deletedCount: number;
};
export function taskDocumentWithMockMetods(
  addToDBStatus: AddToDatabaseStatus,
  deleteFromDBStatus: DeleteFromDBStatus,
  deleteFromDBOptions: DeleteFromDBOptions,
  aggregateStatus: AggregateStatus,
  findOneByIdStatus: FindOneById
) {
  const databaseCreateMock = jest.fn().mockImplementation((device: Device) => {
    switch (addToDBStatus) {
      case "success":
        return Promise.resolve(device);
      case "DuplicatedId":
        return Promise.reject(
          new CustomMongoServerError(11000, { errmsg: "Duplicated id" })
        );
      case "error":
        return Promise.reject("Adding to database failed");
    }
  });

  const databaseDeleteOneMock = jest.fn().mockImplementation(() => {
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
            device: { commandOn: "switch on", commandOff: "switch off", id: '12345' },
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
