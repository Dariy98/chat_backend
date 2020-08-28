const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const socketioJwt = require("socketio-jwt");
const jwt = require("jsonwebtoken");
const schema = require("./validation");

const User = require("./User");
const { request } = require("express");

app.use(bodyParser.json());
app.use(cors());

const secretKey = "32bDQZDSwdmseyrC";

function generateToken(userModel) {
  if (userModel && userModel.toObject) {
    const { password, ...rest } = userModel.toObject();
    return jwt.sign(rest, secretKey, {
      expiresIn: "10h",
    });
  }

  return null;
}

const corsOptions = {
  origin: "http://localhost:3000/",
  optionsSuccessStatus: 200,
};

//connect socket
// io.on("connection", (socket) => {
//   console.log("socket in server connect");

//   socket.on("chatMessage", (message) => {
//     io.emit("message", message);
//   });
//   // client.on("subscribeToTimer", (interval) => {
//   //   console.log("client is subscribing to timer with interval ", interval);

//   //   setInterval(() => {
//   //     client.emit("timer", new Date());
//   //   }, interval);
//   // });
//   connectWithDB();
// });

//auth-socketio-jwt
// set authorization for socket.io !!!
// io.sockets
//   .on(
//     "connection",
//     socketioJwt.authorize({
//       secret: "your secret or public key",
//       timeout: 15000, // 15 seconds to send the authentication message
//     })
//   )
//   .on("authenticated", (socket) => {
//     //this socket is authenticated, we are good to handle more events from it.
//     console.log(`hello! ${socket.decoded_token.name}`);
//   });

// const { error, value } = schema.validate({
//   nickname: "oxsax@$44",
//   password: "24",
// });
// console.log("error", error);
// console.log("value", value);

//accept request with data for mongoDB
app.post("/auth", async (request, response) => {
  if (!request.body) {
    return response.sendStatus(400);
  }
  console.log("body", request.body);

  const { error, value } = schema.validate(request.body);

  if (error) {
    return response.json({ ValidationError });
  }

  //find user in DB
  const user = await User.findOne({
    nickname: request.body.nickname,
  });

  // user exist
  if (user) {
    if (user.password === request.body.password) {
      // return token
      const token = generateToken(user);
      return response.json({ token }).status(201);
    } else {
      return response.status(401);
    }
  }

  // create new user
  const newUser = await createUser(request.body);
  // return token
  const token = generateToken(newUser);
  return response.json({ token }).status(201);
});

//connect with mongoDB
async function connectToDB() {
  try {
    await mongoose.connect("mongodb://localhost/chat", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log("mongoose is connected");
  } catch (e) {
    console.log("database error.....", e);
  }
}

//create user in DB
const createUser = async (userPayload) => {
  console.log("user data if function create", userPayload);
  const user = new User(userPayload);
  await user.save();
  console.log("user is saved");

  return user;
};

const PORT = 3001;

const main = async () => {
  await connectToDB();

  server.listen(PORT);
  console.log(`server listening on http://127.0.0.1:${PORT}`);
};

main();
