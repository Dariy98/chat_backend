//server back
const express = require("express");
const http = require("http");
const io = require("socket.io")();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./User");

const router = express.Router();
const jsonBodyParser = bodyParser.json();

// router.post("/qwe", jsonBodyParser, async ({ body }, res, next) => {
//   try {
//     const user = await body;
//     console.log("user body", user);
//     res.status(200).json({ body });
//   } catch (e) {
//     res.status(401).json({ error: e.message });
//   }
// });

// router.post("/", async ({ body }, res) => {
//   const user = new User({
//     email: body.title,
//     nickname: body.title,
//   });
//   console.log(user);
//   // await user.save();
//   console.log("user save....");
//   // res.redirect('/')
// });

router.post("/", async ({ body }, res) => {
  let rawData;
  request.on("data", (chunk) => (rawData += chunk));
  request.on("end", () => {
    try {
      const { email } = JSON.parse(rawData);
      console.log(email);
    } catch (error) {
      console.log("e....", error);
    }
  });
});

io.on("connection", (client) => {
  client.on("subscribeToTimer", (interval) => {
    console.log("client is subscribing to timer with interval ", interval);

    setInterval(() => {
      client.emit("timer", new Date());
    }, interval);

    connectWithDB();
  });
});

async function connectWithDB() {
  try {
    await mongoose.createConnection(
      "mongodb+srv://ost:1q2w3e@cluster0.y9jnl.mongodb.net/chat?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
    // createUserInDB();
    console.log("in function 'connect!'");
  } catch (e) {
    console.log("error.....", e);
  }
}

//работает
// function createUserInDB() {
//   const user = new User({
//     email: "qweqeq@gmail.com",
//     nickname: "Bob",
//   });

//   user.save();
//   console.log("user save....");
// }
const port = 3001;
io.listen(port);
console.log("listening on port ", port);
