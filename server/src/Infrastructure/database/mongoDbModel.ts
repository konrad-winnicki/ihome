import mongoose from "mongoose";

export const DeviceSchema = new mongoose.Schema({
  id: {
    type: String,
    index: {
      unique: true,
      required: true,
    },
  },

  deviceType: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    unique: true,
    required: true,
  },

  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    required: true,
  },

  commandOff: {
    type: String,
    default: null,
    required: false,
  },

  commandOn: {
    type: String,
    required: true,
  },

  onStatus: {
    type: Boolean,
    default: false,
  },
});

export const ScheduleTimeSchema = new mongoose.Schema({
  hour: {
    type: String,
    required: true,
  },
  minutes: {
    type: String,
    required: true,
  },
});

export const TaskSchema = new mongoose.Schema({
  id: {
    type: String,
    index: {
      unique: true,
      required: true,
    },
  },

  deviceId: {
    type: String,
    index: {
      required: true,
    },
  },

  onStatus: {
    type: Boolean,
    required: true,
  },

  scheduledTime: {
    type: ScheduleTimeSchema,
    required: true,
  },
});
