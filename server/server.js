var express = require("express");
var cors = require("cors");
var parser = require("body-parser");
var serverUtil = require("./serverUtil.js");
var serverConfig = require("./configServer.json");

var port = process.env.PORT || 3001;
var app = express();

// app.use(function (req, res, next) { // enable CORS without external module
//   res.header("Access-Control-Allow-Origin", "*"); // TODO change this to only localhost:3001/3000?
//   res.header("Access-Control-Allow-Methods", "POST");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(cors({
  // origin: "http://192.168.0.225:3000" // TODO move to serverConfig.json
  origin: serverConfig.clientUrl
}));
app.use(parser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(parser.json()); // parse application/json

var server = app.listen(port, () => { // Might have to add 0.0.0.0 as second argument
  console.log("Server started on port=" + port);
});
var io = require("socket.io")(server);

const roomCode = serverConfig.roomCode;
let game = new serverUtil.Game(roomCode);


app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world" });
});

app.get("/info", (req, res) => {
  const obj = {
    "game": game
  };
  res.status(200).json(obj);
});

app.post("/lobbyJoin", (req, res) => { // A player is joining a game
  let name = req.body.name;
  let room = req.body.roomCode;

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

  // console.log("The game is starting");
  io.sockets.emit("lobbyFinish"); // This redirect users to the /game page
  // game.generateFirstTasks();
});


io.on("connection", (socket) => {
  // console.log("New socket connection");
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
    socket.emit("gameTaskShouldRequestUpdate");
  });
  socket.on("gameTaskFinish", (data) => {
    // console.log("gameTaskFinish with name=" + data.name + ", type=" + data.type);
    player.busy = false;
    const gameOver = game.taskFinish(player, data);
    if(gameOver) {
      console.log("GAME OVER!");
      io.sockets.emit("gameOver");
    } else {
      // setTimeout(() => {
      io.sockets.emit("gameTaskShouldRequestUpdate") // Tell all players to request a task update
      // }, 500);
    }
  });
  socket.on("gameTaskRequestUpdate", (data) => {
    if(player.busy) 
      return;
    let taskJson = game.getNextTask(player);
    if(taskJson === null)
      return;

    console.log("Sending a new task to player with name=" + player.name + ", type=" + taskJson.type);
    // player.numTasks++;
    socket.emit("gameTaskNew", {"name": player.name, "task": taskJson});
    player.busy = true;
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
      // TODO handle mid-game disconnections
    }
  });


});
