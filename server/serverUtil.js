var serverConfig = require("./configServer.json");

class Game {

  states = {
    WAITING: 0,
    PLAYING: 1,
    OVER: 2
  };

  constructor(roomId) {
    // console.log("Game() new game id=" + roomId);
    this.room = roomId;
    this.state = this.states.WAITING;
    this.players = [];
    this.taskSequences = [];
  }

  startGame(requesterName) {
    if(!this.isPlayerNameAdmin(requesterName) || this.state !== this.states.WAITING)
      return false;

    if(this.players.length <= 1)
      return false;

    console.log("Starting game with players.length=" + this.players.length);
    for (let i = 0; i < this.players.length; i++) {
      this.taskSequences[i] = new TaskSequence(this.players.length + serverConfig.sequenceLengthAdder, i);
    }
    return true;
  }

  formatName(name) {
    return name.trim();
  }
  playerAdd(name) {
    // if(this.state !== this.states.WAITING || !this.players.includes(name)) {
    //   return undefined;
    // }
    let admin = this.isPlayerNameAdmin(name);
    let p = new Player(name, admin);
    this.players.push(p);
    // console.log("playerJoin() name=" + name + ", totalplayers=" + this.players.length);
    return p;
  }
  playerRemoveByName(name) {
    this.players = this.players.filter((p) => p.name !== name);
  }
  getPlayerByName(name) {
    return this.players.find(p => (p.name === name));
  }
  getPlayerNames() {
    return this.players.map(p => p.name);
  }
  isPlayerNameAdmin(name) {
    return name.toLowerCase().includes("ethan"); // TODO change the admin name
    // This could instead be the first person to join. Also there should only be one admin
  }

  getNextTask(player) {
    console.log("game.getNextTask() Someone wants a new task, name=" + player.name);
    this.taskSequences.sort((a, b) => a.numDone - b.numDone);

    for (let i = 0; i < this.taskSequences.length; i++) {
      const s = this.taskSequences[i];
      if(s.inProgress) {
        // console.log("  skipping sequence.id=" + s.id + " because inProgress");
        continue;
      }
      if(s.isDone()) {
        // console.log("  skipping sequence.id=" + s.id + " because done");
        continue;
      }

      if(serverConfig.completerRepeatsPreviousDisallow > 0) {
        if(s.completers.slice(-1 * serverConfig.completerRepeatsPreviousDisallow).some(p => p.name === player.name)) {
          continue;
        }
      } else {
        if(s.completers.some(p => p.name === player.name)) {  // Players only contribute once
          // console.log("  skipping sequence.id=" + s.id + " because I'm a completer");
          continue;
        }
      }
        // TODO favor players that aren't holding up other players? This probably goes in the sort condition above
      return s.getNextTask(player);
    }
    // console.log("  returning null");
    return null;
  }

  taskFinish(player, socketData) {
    const id = parseInt(socketData.id);
    // console.log("game taskFinish() with name=" + socketData.name + ", id=" + id + ", type=" + socketData.type);
    this.taskSequences.find(s => s.id === id).taskFinish(player, socketData);

    const gameOver = this.taskSequences.every(e => e.isDone()); // Are all sequences done?
    if(gameOver) 
      this.gameOver();
    return gameOver;
  }

  gameOver() {
    this.state = this.states.OVER;
  }
}


class Player {
  constructor(name, admin) {
    this.name = name;
    this.admin = admin;
    this.busy = false;
    this.connected = false;
  }
}

class TaskSequence { // TODO there's a problem with TaskSequences mixing, and some player inputs end up getting lost
  constructor(num, id) {
    this.id = id;
    this.num = num;
    this.numDone = 0;
    this.captions = [];
    this.drawings = [];
    this.completers = [];

    this.inProgress = false;
    this.completingPlayer = null;
  }

  getNextTask(player) {
    this.inProgress = true; // This gets set to false if the completing player gets disconnected so the task gets reassigned
    this.completingPlayer = player;
    console.log("sequence.getNextTask() generating task, id=" + this.id + ", completer names=" + this.completers.map(p => p.name) + ", numDone=" + this.numDone);
    if(this.captions.length === 0 && this.drawings.length === 0) {
      return {
        "id": this.id,
        "type": "taskCaptionInitial",
      };
    } else if(this.drawings.length >= this.captions.length) {
      return {
        "id": this.id,
        "type": "taskCaption",
        "drawing": this.drawings[this.drawings.length - 1],
      };
    } else {
      return {
        "id": this.id,
        "type": "taskDraw",
        "caption": this.captions[this.captions.length - 1],
      };
    }
  }

  taskFinish(player, socketData) {
    // console.log("sequence.taskFinish() completer.name=" + player.name);
    this.inProgress = false;
    this.numDone++;
    this.completers.push(player);
    if(socketData.type === "taskCaptionInitial") {
      this.captions.push(socketData.caption);
    } else if(socketData.type === "taskCaption") {
      this.captions.push(socketData.caption);
    } else if(socketData.type === "taskDraw") {
      this.drawings.push(socketData.drawing);
    }
  }

  isDone() {
    return this.numDone >= this.num;
  }

  getResultsDict() {
    return {
      "id": this.id,
      "captions": this.captions,
      "drawings": this.drawings,
      "completerNames": this.completers.map(p => p.name)
    };
  }
}

module.exports = { Game }
