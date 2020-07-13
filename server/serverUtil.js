
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

    console.log("Starting game with players.length=" + this.players.length);
    for (let i = 0; i < this.players.length; i++) {
      this.taskSequences[i] = new TaskSequence(this.players.length, i);
    }
    this.state = this.states.PLAYING;
    return true;
  }

  formatName(name) {
    return name; // TODO should remove dangerous characters, like emojis?
  }
  playerAdd(name) {
    // if(this.state !== this.states.WAITING || !this.players.includes(name)) {
    //   return undefined;
    // }
    let admin = this.isPlayerNameAdmin(name);
    let p = new Player(name, admin);
    this.players.push(p);
    console.log("playerJoin() name=" + name + ", totalplayers=" + this.players.length);
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
    return name.includes("1"); // TODO change
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
      if(s.completers.some(p => p.name === player.name)) {  // Players only contribute once
        // console.log("  skipping sequence.id=" + s.id + " because I'm a completer");
        continue;
      }
        // TODO favor players that aren't busy right now with numTasks. This probably goes in the sort condition a few lines above
        // TODO allow players to contribute multiple times with a setting enabled
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
    // TODO stop the game
  }
}


class Player {
  constructor(name, admin) {
    this.name = name;
    this.admin = admin;
    this.busy = false;
  }
}

class TaskSequence {
  constructor(num, id) {
    this.id = id;
    this.num = num;
    this.numDone = 0;
    this.captions = [];
    this.drawings = [];
    this.completers = [];
    this.inProgress = false;
  }

  getNextTask(player) {
    this.inProgress = true;
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
    } else { // if(this.captions.length ??? this.drawings.length) {
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
