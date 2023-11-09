import { Model, mongo } from "mongoose";
import { Device } from "../../domain/Device";
import { MongoDeviceRepository } from "../../Infrastructure/device/MongoDeviceRepository";
import { ServerMessages } from "../../ServerMessages";

export class CustomMongoServerError extends mongo.MongoServerError {
  constructor(code: number, message: mongo.ErrorDescription) {
    super(message);
    this.code = code;
  }
}

export function prepareMongoDeviceRepositoryWithMockPerameters(
  deviceDocument: Model<Device>
) {
  const serverMessages = new ServerMessages();
  const mongoDeviceRepository = new MongoDeviceRepository(
    deviceDocument,
    serverMessages
  );

  return mongoDeviceRepository;
}


export function deviceDocumentWithMockMetods(
  addToDBStatus: string,
  deleteFromDBStatus?: string,
  findOneByIdStatus?: string |null
) {
  const databaseCreateMock = jest.fn().mockImplementation((device: Device) => {
    switch (addToDBStatus) {
      case "success":
        return Promise.resolve(device);
      case "error":
        return Promise.reject(new Error("Adding to database failed"));
      case "DuplicationError":
        return Promise.reject(
          new CustomMongoServerError(11000, { errmsg: "Duplicated name" })
        );
      case "DuplicatedId":
        return Promise.reject(
          new CustomMongoServerError(11000, { errmsg: "Duplicated id" })
        );
      case "MongoServerError":
        return Promise.reject(
          new CustomMongoServerError(1, { errmsg: "MongoServerError" })
        );

      case "MongoError":
        return Promise.reject(new Error("Mongo Error"));
    }
  });

  const databaseDeleteOneMock = jest.fn().mockImplementation(() => {
    switch (deleteFromDBStatus) {
      case "success":
        return Promise.resolve("Deleted from database");
      case "error":
        return Promise.reject("NOT deleted from database");
    }
  });

  const databaseFindOneMock = jest.fn().mockImplementation(()=>{
    switch (findOneByIdStatus) {
      case "success":
        return Promise.resolve({
          id: "12345",
          deviceType: "switch",
          name: "switch1",
          commandOn: "switch on",
        });
      case "error":
        return Promise.reject("Item not found");

        case null:
          return Promise.resolve(null);
    }
  })

  const deviceDokumentMock = {
    create: databaseCreateMock,
    deleteOne: databaseDeleteOneMock,
    findOne: databaseFindOneMock
    
  } as unknown as Model<Device>;

  return deviceDokumentMock;
}

