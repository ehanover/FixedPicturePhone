var cors = require("cors");
var express = require("express");
var parser = require("body-parser");
var serverConfig = require("./configServer.json");
var serverUtil = require("./serverUtil.js");

var port = process.env.PORT || serverConfig.serverPort;
var app = express();

// app.use(function (req, res, next) { // enable CORS without external module
//   res.header("Access-Control-Allow-Origin", "*"); // TODO change this to only localhost:3001/3000?
//   res.header("Access-Control-Allow-Methods", "POST");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(cors({
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



app.get("/debug", (req, res) => { // Note: this is visible from the server port, not the website port
  const obj = {
    "game": game
  };
  res.status(200).json(obj);
});

app.post("/lobbyJoin", (req, res) => {
  let name = game.formatName(req.body.name);
  let room = req.body.roomCode;

  if(roomCode === room) {
    if(game.getPlayerNames().includes(name)) {
      res.status(400).send({"message": "You are not allowed to join that room."});
    } else {
      res.status(200).send({"message": "OK", "admin": game.isPlayerNameAdmin(name), "nameReturn": name});
    }
  } else { // Room name invalid
    res.status(400).send({"message": "That room code is invalid."});
  }
  res.end(400);
});

app.post("/lobbyFinishRequest", (req, res) => {
  if(!game.startGame(req.body.name)) return; // TODO add other game start checks here
  
  console.log("The game is starting");

  game.state = game.states.PLAYING;
  io.sockets.emit("lobbyFinish"); // This redirect users to the /game page
});

app.get("/results", (req, res) => {
  if(game.state != game.states.OVER)
    res.end(400);

  let ret = {"taskSequences": []};
  game.taskSequences.forEach(s => {
    ret.taskSequences.push(s.getResultsDict());
  });
  res.status(200).send(ret);
});


io.on("connection", (socket) => {
  // console.log("New socket connection");
  let player;


  socket.on("lobbyConnect", (data) => { // A new socket connection from Lobby.js
    if(game.state !== game.states.WAITING)
      return;

    let name = data.name;
    player = game.playerAdd(name)

    io.sockets.emit("lobbyUpdate", {players: game.getPlayerNames()});
    console.log("Player " + player.name + " connected. Users in room: " + game.getPlayerNames());
  });


  socket.on("gameConnect", (data) => { // A new socket connection from Game.js
    if(game.state !== game.states.PLAYING)
      return;

    let name = data.name;
    player = game.getPlayerByName(name);
    console.log("Player with name=" + name + " is trying to connect...");
    console.log("All players: " + game.getPlayerNames());
    if(player === undefined) {
      console.log("Game connection, player UNKNOWN!");
      return;
    }
    player.connected = true;

    console.log("Game connection, name=" + player.name);
    socket.emit("gameTaskShouldRequestUpdate");
  });
  socket.on("gameTaskFinish", (data) => {
    console.log("gameTaskFinish with name=" + data.name + ", type=" + data.type);
    player.busy = false;
    const gameOver = game.taskFinish(player, data);
    if(gameOver) {
      console.log("Game over!");
      io.sockets.emit("gameOver");
    } else {
      io.sockets.emit("gameTaskShouldRequestUpdate") // Tell all players to request a task update
    }
  });
  socket.on("gameTaskRequestUpdate", (data) => {
    if(player.busy) 
      return;
    let taskJson = game.getNextTask(player);
    if(taskJson === null)
      return;

    console.log("Sending a new task to player with name=" + player.name + ", type=" + taskJson.type);
    socket.emit("gameTaskNew", {"name": player.name, "task": taskJson});
    player.busy = true;
  });


  socket.on("disconnect", () => {
    if(player === undefined) {
      console.log("Disconnect by unknown!");
      return;
    }

    if(game.state === game.states.WAITING) {
      game.playerRemoveByName(player.name);
      io.sockets.emit("lobbyUpdate", {players: game.getPlayerNames()});
      // console.log("Users in room: " + game.getPlayerNames());

    } else if(game.state === game.states.PLAYING) {
      // Make sure people get back into the game

      if(player.connected === false) {
        console.log("Disconnect in game, but the player wasn't connected before");
        return;
      }
      console.log("Disconnect in game, player=" + player.name);
      player.busy = false;
      player.connected = false;
      
      let playersOldTask = game.taskSequences.find((s) => (s.completingPlayer !== null) && (s.completingPlayer.name === player.name));
      if(playersOldTask !== undefined)
        playersOldTask.inProgress = false;

    } else if(game.state === game.states.OVER) {
      // Disconnecting is allowed here
    }
  });


});
