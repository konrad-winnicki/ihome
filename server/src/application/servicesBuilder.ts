import {
  UserMongoDbManager,
} from "../infractructure/mongoDbManager";
import { UserService } from "./UserService";
import { connectDatabase } from "../infractructure/mongoDbConnection";
import config from "../../config/config";
import { User } from "../domain/User";
import { UserSchema } from "../infractructure/mongoDbModel";
import { Connection } from "mongoose";

export type Dependencias = {
  connection: Connection
  userService: UserService;
};

export  function buildServices():Dependencias {
  const connection = connectDatabase(config.MONGO_URI, config.DATABASE)
  const userDocument = connection.model<User>("User", UserSchema);

   if (!userDocument || !connection) {
    throw new Error("connection and document must exist");
  }
  const userManager = new UserMongoDbManager(userDocument);

  const userService = new UserService(userManager);
  return {
    connection: connection,
    userService: userService,
  }
}
