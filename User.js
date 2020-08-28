const { Schema, model } = require("mongoose");

const schema = new Schema({
  id: {
    type: Schema.ObjectId,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  nickname: {
    type: String,
  },
  idAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("User", schema);
