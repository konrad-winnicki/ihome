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
        return Promise.resolve({ acknowledged: true, deletedCount: 1 });
      case "error":
        return Promise.reject(
          "NOT deleted from database. Internal database error."
        );
    }
  });

 

  const databaseFindOneMock = jest.fn().mockImplementation(() => {
    switch (findOneByIdStatus) {
      case "success":
        return Promise.resolve({
          id: "678910",
          onStatus: true,
          scheduledTime: { hour: "10", minutes: "56" },
          device: "12345",
        });
      case "error":
        return Promise.reject("Internal database error");

      case null:
        return Promise.reject(`Task not exists`);
    }
  });

  const databaseFindMock = jest.fn().mockImplementation(() => {
    
        return Promise.resolve([{
          id: "678910",
          onStatus: true,
          scheduledTime: { hour: "10", minutes: "10" },
          deviceId: "12345",
        }]);
     
  });
  const taskDokumentMock = {
    create: databaseCreateMock,
    deleteOne: databaseDeleteOneMock,
    findOne: databaseFindOneMock,
    find: databaseFindMock
  } as unknown as Model<Task>;

  return taskDokumentMock;
}
