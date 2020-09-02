const { Schema, model } = require("mongoose");

const schema = new Schema({
  id: {
    type: Schema.ObjectId,
  },
  password: {
    type: String,
  },
  nickname: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  isBane: {
    type: Boolean,
    default: false,
  },
  isMute: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
  },
  lastMessageDate: {
    type: Date,
  },
});

module.exports = model("User", schema);
