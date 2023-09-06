import mongoose from "mongoose";

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
