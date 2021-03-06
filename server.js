const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const schema = require("./validation/validation");

const User = require("./models/User");
const { request } = require("express");

app.use(bodyParser.json());
app.use(cors());

const secretKey = "32bDQZDSwdmseyrC";

const generateToken = (userModel) => {
  if (userModel && userModel.toObject) {
    const { password, ...rest } = userModel.toObject();
    return jwt.sign(rest, secretKey, {
      expiresIn: "10h",
    });
  }

  return null;
};

const corsOptions = {
  origin: "http://localhost:3000/",
  optionsSuccessStatus: 200,
};

//accept request with data for mongoDB
app.post("/auth", async (request, response) => {
  if (!request.body) {
    return response.sendStatus(400);
  }
  console.log("body", request.body);

  const { error, value } = schema.validate(request.body);

  if (error) {
    response.json({ error });
    throw error;
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

  // else create new user
  const newUser = await createUser(request.body);

  // return token
  const token = generateToken(newUser);

  return response.json({ token }).status(201);
});

//connect socket
const connections = {};

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const payload = await jwt.verify(token, secretKey);

    socket.userId = payload._id;
    socket.name = payload.nickname;
    socket.isBane = payload.isBane;
    socket.isAdmin = payload.isAdmin;
    socket.color = payload.color;
    next();
  } catch (err) {
    console.log("error in socket with token....");
  }
});

io.on("connection", async (socket) => {
  console.log("Connected: " + socket.name + " - id - ", socket.userId);

  //if user ban
  if (socket.isBane) {
    socket.disconnect(true);
    await updateOnlineStatus(socket, false);
    return console.log(`user ${socket.userId} disconnect because "ban"`);
  }

  connections[socket.userId] = socket;

  //update user online
  await updateOnlineStatus(socket, true);

  //get users and send for online list
  const allUsers = await User.find({});
  if (allUsers.length) {
    socket.emit("result", allUsers);
    socket.broadcast.emit("result", allUsers);
  }

  socket.on("disconnect", async () => {
    console.log("Disconnected: " + socket.name);

    //update status online = false
    await updateOnlineStatus(socket, false);

    //get users and send for online list
    const allUsers = await User.find({});
    if (allUsers.length) {
      socket.emit("result", allUsers);
      socket.broadcast.emit("result", allUsers);
    }
  });

  socket.on("chatMessage", async (message) => {
    const user = await User.findById(socket.userId);
    socket.user = user.toObject();

    const currentTime = new Date();

    if (user.isMute) {
      return console.log("user mute and can't send message");
    }
    if (currentTime - socket.lastMessageDate < 15000) {
      console.log("limit 1 message in 15 secconds!");
      socket.emit(
        "message",
        "You can't send message because limit 1 message in 15 secconds"
      );
    } else {
      io.emit("message", {
        id: socket.userId,
        nickname: socket.name,
        color: socket.color,
        message: message.text,
        date: new Date(),
      });

      socket.lastMessageDate = new Date();
    }
  });

  socket.on("ban", async (user) => {
    if (socket.isAdmin) {
      console.log("ban", user);

      await updateBan(user, true);

      const connectionToBan = connections[user.id];

      if (connectionToBan) {
        connectionToBan.disconnect(true);
      }

      const allUsers = await User.find({});
      if (allUsers.length) {
        socket.emit("result", allUsers);
        socket.broadcast.emit("result", allUsers);
      }
    }
  });

  socket.on("unban", async (user) => {
    if (socket.isAdmin) {
      console.log("unban", user);

      await updateBan(user, false);

      const allUsers = await User.find({});
      if (allUsers.length) {
        socket.emit("result", allUsers);
        socket.broadcast.emit("result", allUsers);
      }
    }
  });

  socket.on("mute", async (user) => {
    if (socket.isAdmin) {
      console.log("mute", user.id);

      await updateMute(user, true);

      const allUsers = await User.find({});
      if (allUsers.length) {
        socket.emit("result", allUsers);
        socket.broadcast.emit("result", allUsers);
      }
    }
  });

  socket.on("unmute", async (user) => {
    if (socket.isAdmin) {
      console.log("unmute", user.id);

      await updateMute(user, false);

      const allUsers = await User.find({});
      if (allUsers.length) {
        socket.emit("result", allUsers);
        socket.broadcast.emit("result", allUsers);
      }
    }
  });
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

const updateOnlineStatus = async (socket, value) => {
  const user = User.findOneAndUpdate(
    { _id: socket.userId },
    { isOnline: value },
    { new: true }
  );

  return user;
};

const updateMute = async (user, value) => {
  const userIsMute = User.findOneAndUpdate(
    { _id: user.id },
    { isMute: value },
    { new: true }
  );

  return userIsMute;
};

const updateBan = async (user, value) => {
  const userIsBane = User.findOneAndUpdate(
    { _id: user.id },
    { isBane: value },
    { new: true }
  );

  return userIsBane;
};

const PORT = 3001;

const main = async () => {
  await connectToDB();

  server.listen(PORT);
  console.log(`server listening on http://127.0.0.1:${PORT}`);
};

main();
