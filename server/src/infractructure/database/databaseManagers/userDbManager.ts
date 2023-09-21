import { UserInterface } from "../../../application/UserInterface";
import { User } from "../../../domain/User";
import mongoose, { Model } from "mongoose";
import { mongo } from "mongoose";

export class UserDbManager implements UserInterface {
  private userDocument: Model<User>;
  constructor(userDocument: Model<User>) {
    this.userDocument = userDocument;
  }

  async createUser(user: User): Promise<string> {
    const newUser = {
      id: user.id,
      email: user.email,
      password: user.password,
      nickName: user.nickName,
      registrationDate: user.registrationDate,
    };
    try {
      const UserFromDB = await this.userDocument.create(newUser);
      return UserFromDB.id;
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        this.validationErrorHandler(err);
      } else if (err instanceof mongo.MongoServerError) {
        this.uniqueViolationErrorHandler(err);
      }
      throw err;
    }
  }

  async findUserByEmail(playerEmail: string): Promise<User | null> {
    const userDetails = await this.userDocument.findOne({
      email: playerEmail,
    });
    if (!userDetails) {
      return null;
    }
    const { nickName, email, password, id, registrationDate } = userDetails;
    const user = new User(id, email, nickName, registrationDate, password);
    return user;
  }

  validationErrorHandler(err: mongoose.Error.ValidationError) {
    if (err.errors.email instanceof mongoose.Error.ValidatorError) {
      throw new Error("EmailInvalidError");
    }
    throw err;
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("email")) {
      throw new Error("EmailConflictError");
    }
    if (isUniqueViolation && err.errmsg.includes("nickName")) {
      throw new Error("NameConflictError");
    }
    throw err;
  }
}
