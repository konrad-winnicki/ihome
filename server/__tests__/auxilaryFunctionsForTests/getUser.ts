import { User } from "../../src/domain/User";
import { UserSchema } from "../../src/infractructure/database/mongoDbModel";
import { Connection } from "mongoose";
export async function getUserFromDB(connection: Connection, email: string) {
  const userDocument = connection.model<User>("User", UserSchema);
  const userDetails = await userDocument.findOne({
    email: email,
  });

  return userDetails;
}
