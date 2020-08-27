const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const User = require("./User");
app.use(bodyParser.json());
app.use(cors());

const corsOptions = {
  origin: "http://localhost:3000/",
  optionsSuccessStatus: 200,
};

//connect socket
io.on("connection", (socket) => {
  console.log("socket in server connect");

  socket.on("chatMessage", (message) => {
    io.emit("message", message);
  });
  // client.on("subscribeToTimer", (interval) => {
  //   console.log("client is subscribing to timer with interval ", interval);

  //   setInterval(() => {
  //     client.emit("timer", new Date());
  //   }, interval);
  // });
  connectWithDB();
});

let newUser;
//accept request with data for mongoDB
app.post("/", function (request, response) {
  if (!request.body) return response.sendStatus(400);

  console.log("body", request.body);
  newUser = {
    email: request.body.email,
    password: request.body.password,
    nickname: request.body.name,
  };
  validationUserData(newUser);
  //delete
  response.send(`data send`);
});

const validationUserData = (user) => {
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(user.email)) {
    console.log("bad email");
  } else {
    newUser.email = user.email;
  }
  if (/^[^%/&?,';:!-+!@#$^*)(]{3,15}$/i.test(user.nickname)) {
    newUser.nickname = user.nickname;
  } else {
    console.log("name bad");
  }
  if (user.password === "") {
    console.log("password short");
  }
  if (user.password.length < 6) {
    console.log("меньше 6ти");
  }
  console.log("new", newUser);
};

//connect with mongoDB
async function connectWithDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://ost:1q2w3e@cluster0.y9jnl.mongodb.net/chat?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }
    );
    console.log("in function 'connect!'");
    createUserInDB(newUser);
  } catch (e) {
    console.log("error.....", e);
  }
}

//create user in DB
function createUserInDB(obj) {
  // const user = new User({
  //   email: obj.email,
  //   nickname: obj.nickname,
  // });
  const user = new User({ obj });
  user.save();
  console.log("user save....");
}
server.listen(3001);

// function createUserInDB() {
//   // const user = new User({
//   //   email: "qdssfdfdsfwfgdgdv@gmail.com",
//   //   nickname: "Bobi",
//   // });
//   const user = new User({
//     email: "lol@gmail.com",
//     nickname: "Bobi",
//   });
//   user.save();
//   console.log("user save....");
// }
// server.listen(3001);
