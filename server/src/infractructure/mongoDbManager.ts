import { ChatRoomInterface } from "../application/ChatRoomInterface";
import { UserInterface } from "../application/UserInterface";
import { ChatRoom } from "../domain/ChatRoom";
import { User } from "../domain/User";
//import { PlayerList } from "../domain/PlayerList";
import mongoose, { Model } from "mongoose";
import {  mongo} from "mongoose";
import { ChatRoomList } from "../domain/ChatRoomList";

export class UserMongoDbManager implements UserInterface {
  private userDocument: Model<User>;
  constructor(userDocument: Model<User>) {
    this.userDocument = userDocument;
  }

  createPlayerDoc(user: User) {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      registrationDate: user.registrationDate,
      name: user.nickName,
    };
  }

  validationErrorHandler(err: mongoose.Error.ValidationError) {
    if (err.errors.email instanceof mongoose.Error.ValidatorError) {
      throw new Error("EmailInvalidError");
    }
    throw err;
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

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("email")) {
      throw new Error("EmailConflictError");
    }
    if (isUniqueViolation && err.errmsg.includes("name")) {
      throw new Error("NameConflictError");
    }
    throw err;
  }

  async findUser(playerID: string): Promise<User> {
    const userDetails = await this.userDocument.findById(playerID);
    if (!userDetails) {
      throw new Error("PlayerNotFound");
    }
    const { nickName, email, password, id, registrationDate } = userDetails;
    const user = new User(id, email, nickName, registrationDate, password);
    return user;
  }

  async findUserByEmail(playerEmail: string): Promise<User> {
    const userDetails = await this.userDocument.findOne({
      email: playerEmail,
    });
    if (!userDetails) {
      throw new Error("EmailNotExists");
    }
    const { nickName, email, password, id, registrationDate } = userDetails;
    const user = new User(id, email, nickName, registrationDate, password);
    return user;
  }
  /*
  async getPlayerList(): Promise<PlayerList> {
    const playersFromDB = await this.playerDocument.find({});

    const players = playersFromDB.map((playerFromDB: MongoPlayerType) => {
      const player = new Player(
        playerFromDB.email,
        playerFromDB.password,
        playerFromDB.games,
        playerFromDB.name,
        playerFromDB._id
      );
      player.registrationDate = playerFromDB.registrationDate;
      return player;
    });
    return new PlayerList(players);
  }

  async changeName(
    playerId: string,
    newName: string
  ): Promise<Partial<Player>> {
    try {
      const player = await this.playerDocument.findByIdAndUpdate(playerId, {
        name: newName,
      });
      if (!player) {
        throw new Error("changeNameError");
      }
      const returnPlayer = { id: player.id, name: newName };
      return returnPlayer;
    } catch (err) {
      if (err instanceof mongo.MongoServerError) {
        this.uniqueViolationErrorHandler(err);
      }
      throw err;
    }
  }
*/
}



export class ChatRoomMongoDbManager implements ChatRoomInterface {
  private chatRoomDocument: Model<ChatRoom>;
  constructor(chatRoomDocument: Model<ChatRoom>) {
    this.chatRoomDocument = chatRoomDocument;
  }

  createPlayerDoc(user: User) {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      registrationDate: user.registrationDate,
      name: user.nickName,
    };
  }

  validationErrorHandler(err: mongoose.Error.ValidationError) {
    if (err.errors.email instanceof mongoose.Error.ValidatorError) {
      throw new Error("EmailInvalidError");
    }
    throw err;
  }

  async createChatRoom(chatRoom: ChatRoom): Promise<string> {
    const newChatRoom = {
      id:  chatRoom.id,
      name: chatRoom.name,
      ownerId: chatRoom.ownerId,
      participants: [],
      creationDate: chatRoom.creationDate,

    };
    try {
      const chatRoomFromDB = await this.chatRoomDocument.create(newChatRoom);
      console.log(chatRoomFromDB)
      return chatRoomFromDB.id;
    } catch (err) {
      console.log(err)
      if (err instanceof mongoose.Error.ValidationError) {
        this.validationErrorHandler(err);
      } else if (err instanceof mongo.MongoServerError) {
        this.uniqueViolationErrorHandler(err);
      }
      throw err;
    }
  }

  uniqueViolationErrorHandler(err: mongo.MongoServerError) {
    const isUniqueViolation = err.code === 11000;
    if (isUniqueViolation && err.errmsg.includes("email")) {
      throw new Error("EmailConflictError");
    }
    if (isUniqueViolation && err.errmsg.includes("name")) {
      throw new Error("NameConflictError");
    }
    throw err;
  }
/*
  async findUser(playerID: string): Promise<User> {
    const userDetails = await this.userDocument.findById(playerID);
    if (!userDetails) {
      throw new Error("PlayerNotFound");
    }
    const { nickName, email, password, id, registrationDate } = userDetails;
    const user = new User(id, email, password, nickName, registrationDate);
    return user;
  }

  async findUserByEmail(playerEmail: string): Promise<User> {
    const userDetails = await this.userDocument.findOne({
      email: playerEmail,
    });
    if (!userDetails) {
      throw new Error("EmailNotExists");
    }
    const { nickName, email, password, id, registrationDate } = userDetails;
    const user = new User(id, email, password, nickName, registrationDate);
    return user;
  }

  */
  
  async getChatRoomList(): Promise<ChatRoomList> {
    const chatRoomsFromDB = await this.chatRoomDocument.find({});

    const chatRooms = chatRoomsFromDB.map((chatRoomFromDB: ChatRoom) => {
      const chatRoom = new ChatRoom(
        chatRoomFromDB.id,
        chatRoomFromDB.name,
        chatRoomFromDB.ownerId,
        chatRoomFromDB.participants,
        chatRoomFromDB.creationDate
      );
      return chatRoom;
    });

    const chatRoomList =  new ChatRoomList(chatRooms);
    console.log(chatRoomList)
    return chatRoomList
  }
/*
  async changeName(
    playerId: string,
    newName: string
  ): Promise<Partial<Player>> {
    try {
      const player = await this.playerDocument.findByIdAndUpdate(playerId, {
        name: newName,
      });
      if (!player) {
        throw new Error("changeNameError");
      }
      const returnPlayer = { id: player.id, name: newName };
      return returnPlayer;
    } catch (err) {
      if (err instanceof mongo.MongoServerError) {
        this.uniqueViolationErrorHandler(err);
      }
      throw err;
    }
  }
*/
}