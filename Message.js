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
  data: {
    type: Date,
  },
});

module.exports = model("Message", schema);
