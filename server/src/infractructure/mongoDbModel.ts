import mongoose from "mongoose";
import { User } from "../domain/User";

export const UserSchema = new mongoose.Schema({
  nickName: {
    type: String,
    index: {
      unique: true,
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: function (value: string) {
      const emailRegex = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      return emailRegex.test(value);
    },
  },
  password: {
    type: String,
    required: true,
  },

  id: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: Date,
    required: true,
  },
  
});

export const ChatRoomSchema = new mongoose.Schema({
  id: {
    type: String,
      unique: true,
  },

  ownerId: {
    type: String,
    
  },

  name: {
    type: String,
    index: {
      unique: true,
    },
  },
  participants: {
    type: Array<User>,
    required: true,
  },

 
  creationDate: {
    type: Date,
    required: true,
  },
  
});

