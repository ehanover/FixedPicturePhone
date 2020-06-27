var express = require("express");
var cors = require("cors");
var parser = require("body-parser");
var serverUtil = require("./serverUtil.js");

var port = process.env.PORT || 3001;
var app = express();

// enable CORS without external module
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // TODO change this to only localhost:3001/3000?
//   res.header("Access-Control-Allow-Methods", "POST");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(cors({
  origin: "http://192.168.0.225:3000"
}));
app.use(parser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(parser.json()); // parse application/json

const roomCode = "ABCD";
let game = new serverUtil.Game(roomCode);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world" });
});

app.post("/home", (req, res) => { // A player is joining a game
  let name = req.body.name;
  let room = req.body.roomCode;
  // console.log("/home POST: Connection to room=" + room + " by name=" + name);

  if(room === roomCode) {
    // if(game.playerJoin(name)) {
    //   res.status(200).send({"message": "OK"});
    // } else {
    //   res.status(400).send({"message": "You are not allowed to join that room."});
    // }
    res.status(200).send({"message": "OK"});
  } else { // Room name invalid
    res.status(400).send({"message": "That room code is invalid."});
  }
  res.end(400);
});


var server = app.listen(port, () => {
  console.log("Server started on port=" + port);
});

var io = require("socket.io")(server);
io.on("connection", (socket) => {
  // console.log("A user connected");
  let name;

  socket.on("lobbyPlayerJoined", (data) => {
    name = data.name;
    console.log("Connect name=" + name);

    game.playerJoin(name)
    console.log("Users in room: " + game.getPlayerNames());
    io.sockets.emit("lobbyPlayersUpdate", { players: game.getPlayerNames()});
  });

  // setTimeout(function() {
  //   socket.emit("otherPlayerJoined", { name: "fakename"});
  // }, 1000);

  socket.on("disconnect", () => {
    console.log("Disconnect name=" + name);

    game.playerRemoveByName(name)
    console.log("Users in room: " + game.getPlayerNames());
    io.sockets.emit("lobbyPlayersUpdate", { players: game.getPlayerNames()});
  })

});
