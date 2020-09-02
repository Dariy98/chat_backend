const { Schema, model } = require("mongoose");

const schema = new Schema({
  id: {
    type: Schema.ObjectId,
  },
  nickname: {
    type: String,
  },
  text: {
    type: String,
  },
  date: {
    type: Date,
  },
});

module.exports = model("Message", schema);
