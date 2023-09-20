import { ChatRoomInterface } from "../application/ChatRoomInterface";
import { UserInterface } from "../application/UserInterface";
import { ChatRoom } from "../domain/ChatRoom";
import { User } from "../domain/User";
import mongoose, { Model } from "mongoose";
import {  mongo} from "mongoose";
import { ChatRoomList } from "../domain/ChatRoomList";

export class UserMongoDbManager implements UserInterface {
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

}



export class ChatRoomMongoDbManager implements ChatRoomInterface {
  private chatRoomDocument: Model<ChatRoom>;
  constructor(chatRoomDocument: Model<ChatRoom>) {
    this.chatRoomDocument = chatRoomDocument;
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("email")) {
      throw new Error("EmailConflictError");
    }
    if (isUniqueViolation && (err.errmsg.includes("name") || err.errmsg.includes("nickName"))) {
      throw new Error("NameConflictError");
    }
    
    throw err;
  }

 
  async createChatRoom(chatRoom: ChatRoom): Promise<string> {
    const newChatRoom = {
      id: chatRoom.id,
      name: chatRoom.name,
      ownerId: chatRoom.ownerId,
      participants: [],
      creationDate: chatRoom.creationDate,

    };
    try {
      const chatRoomFromDB = await this.chatRoomDocument.create(newChatRoom);
      return chatRoomFromDB.id;
    
    } catch (err) {
      if (err instanceof mongo.MongoServerError) {
        this.uniqueViolationErrorHandler(err);
      }
      throw err;
    }
  }

  
  async getChatRoomList(): Promise<ChatRoomList> {
    const chatRoomsFromDB = await this.chatRoomDocument.find().sort({'name': 1});
    console.log(chatRoomsFromDB)

    const chatRooms = chatRoomsFromDB.map((chatRoomFromDB: ChatRoom) => {
      const chatRoom = new ChatRoom(
        chatRoomFromDB.id,
        chatRoomFromDB.name,
        chatRoomFromDB.ownerId,
        chatRoomFromDB.creationDate
      );
      return chatRoom;
    });

    const chatRoomList =  new ChatRoomList(chatRooms);
    return chatRoomList
  }

}