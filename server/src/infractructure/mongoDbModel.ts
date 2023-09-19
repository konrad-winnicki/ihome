import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
  nickName: {
    type: String,
    index: {
      unique: true,
      partialFilterExpression: { nickName: { $type: "string" } },
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
    required: false,
  },

  id: {
    type: String,
    index: {
      unique: true,
      required: true,
    },
  },
  registrationDate: {
    type: Date,
    required: true,
  },
});

export const ChatRoomSchema = new mongoose.Schema({
  id: {
    type: String,
    index: {
      unique: true,
      required: true,
    },
  },

  ownerId: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    index: {
      unique: true,
      required: true,
    },
  },

  creationDate: {
    type: Date,
    required: true,
  },
});
