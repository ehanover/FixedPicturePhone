var express = require("express");
var cors = require("cors");
var parser = require("body-parser");
var serverUtil = require("./serverUtil.js");

var port = process.env.PORT || 3001;
var app = express();

// app.use(function (req, res, next) { // enable CORS without external module
//   res.header("Access-Control-Allow-Origin", "*"); // TODO change this to only localhost:3001/3000?
//   res.header("Access-Control-Allow-Methods", "POST");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(cors({
  origin: "http://192.168.0.225:3000" // TODO move to serverConfig.json
}));
app.use(parser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(parser.json()); // parse application/json

var server = app.listen(port, () => { // Might have to add 0.0.0.0 as second argument
  console.log("Server started on port=" + port);
});
var io = require("socket.io")(server);

const roomCode = "ABCD";
let game = new serverUtil.Game(roomCode);


app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world" });
});

app.post("/lobbyJoin", (req, res) => { // A player is joining a game
  let name = req.body.name;
  let room = req.body.roomCode;
  // console.log("/home POST: Connection to room by name=" + name);

  if(roomCode === room) {
    if(game.getPlayerNames().includes(name)) {
      res.status(400).send({"message": "You are not allowed to join that room."});
    } else {
      res.status(200).send({"message": "OK", "admin": game.isPlayerNameAdmin(name)});
    }
  } else { // Room name invalid
    res.status(400).send({"message": "That room code is invalid."});
  }
  res.end(400);
});

app.post("/lobbyFinishRequest", (req, res) => {
  if(!game.startGame(req.body.name)) return; // TODO add other game start checks here

  console.log("The game is starting");
  io.sockets.emit("lobbyFinish"); // This redirect users to the /game page
  // game.generateFirstTasks();
});

app.get("/status", (req, res) => {
  let statusJson = {
    "names": game.getPlayerNames(),
    "state": game.state
  };
  res.status(200).json(statusJson);
});



io.on("connection", (socket) => {
  // console.log("A user connected");
  let player;


  socket.on("lobbyConnect", (data) => {
    let name = data.name;
    player = game.playerAdd(name)

    io.sockets.emit("lobbyUpdate", {players: game.getPlayerNames()});
    console.log("Users in room: " + game.getPlayerNames());
  });


  socket.on("gameConnect", (data) => {
    let name = data.name;
    player = game.getPlayerByName(name);
    if(player === undefined) {
      console.log("Connect unknown!");
      return;
    }

    console.log("Game join name=" + player.name);
    let task = game.getNextTask(player);
    let taskJson = game.getTaskJson(task);
    console.log("taskJson.type=" + taskJson.type);
    socket.emit("gameTaskUpdate", {"name": name, "task": taskJson});
  });
  socket.on("gameTaskFinish", (data) => {
    game.taskFinish(player, data);
    // TODO broadcast task update
  });


  socket.on("disconnect", () => {
    if(player === undefined) {
      console.log("Disconnect by unknown!");
      return;
    }

    console.log("Disconnect name=" + player.name);
    if(game.state === game.states.WAITING) {
      game.playerRemoveByName(player.name)
      io.sockets.emit("lobbyUpdate", {players: game.getPlayerNames()});
      // console.log("Users in room: " + game.getPlayerNames());
    } else if(game.state === game.states.PLAYING) {
      console.log("Disconnect IN GAME!");
    }
  });


});
