const { Schema, model } = require("mongoose");

const schema = new Schema({
  email: {
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
