// // //server back
// const express = require("express");
// const http = require("http");
// const io = require("socket.io")();
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const User = require("./User");

// const router = express.Router();
// const jsonBodyParser = bodyParser.json();

// express.use(bodyParser);

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

// io.on("connection", (client) => {
//   client.on("subscribeToTimer", (interval) => {
//     console.log("client is subscribing to timer with interval ", interval);

//     setInterval(() => {
//       client.emit("timer", new Date());
//     }, interval);

//     connectWithDB();
//   });
// });

// async function connectWithDB() {
//   try {
//     await mongoose.createConnection(
//       "mongodb+srv://ost:1q2w3e@cluster0.y9jnl.mongodb.net/chat?retryWrites=true&w=majority",
//       {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useFindAndModify: false,
//       }
//     );
//     // createUserInDB();
//     console.log("in function 'connect!'");
//   } catch (e) {
//     console.log("error.....", e);
//   }
// }

// //работает
// // function createUserInDB() {
// //   const user = new User({
// //     email: "qweqeq@gmail.com",
// //     nickname: "Bob",
// //   });

// //   user.save();
// //   console.log("user save....");
// // }

// const port = 3001;
// io.listen(port);
// console.log("listening on port ", port);
//=====================================================================
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const collection = mongodb.db("chat").collection("users");

const User = require("./User");
app.use(bodyParser.json());
app.use(cors());

const corsOptions = {
  origin: "http://localhost:3000/",
  optionsSuccessStatus: 200,
};

//connect socket
io.on("connection", (client) => {
  client.on("subscribeToTimer", (interval) => {
    console.log("client is subscribing to timer with interval ", interval);

    setInterval(() => {
      client.emit("timer", new Date());
    }, interval);

    connectWithDB();
  });
});

let newUser;
//accept request with data for mongoDB
app.post("/", function (request, response) {
  if (!request.body) return response.sendStatus(400);

  console.log("body", request.body);
  newUser = {
    email: request.body.email,
    nickname: request.body.name,
  };
  // createUserInDB(request.body.email, request.body.name);
  response.send(`${request.body.email}`);
});

//connect with mongoDB
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
    console.log("in function 'connect!'");
    // createUserInDB(newUser);
    createUserInDB();
  } catch (e) {
    console.log("error.....", e);
  }
}

//create user in DB
//not working
// async function createUserInDB(newUser) {
//   // const user = new User({
//   //   email: email,
//   //   nickname: name,
//   // });
//   const user = new User({
//     email: newUser.email,
//     nickname: newUser.nickname,
//   });

//   await user.save();
//   console.log("user save....");
// }
function createUserInDB() {
  // const user = new User({
  //   email: "qdssfdfdsfwfgdgdv@gmail.com",
  //   nickname: "Bobi",
  // });
  collection.insert({
    email: "qdssfdfdsfwfgdgdv@gmail.com",
    nickname: "Bobi",
  });
  // user.save();
  console.log("user save....");
}
server.listen(3001);
