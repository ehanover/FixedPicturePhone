
class Game {

  states = {
    WAITING: 0,
    PLAYING: 1,
    OVER: 2
  };

  constructor(roomId) {
    // console.log("Game() new game id=" + roomId);
    this.room = roomId;
    this.players = [];
    this.state = this.states.WAITING;
  }

  startGame(requesterName) {
    if(!this.isPlayerNameAdmin(requesterName))
      return false;

    this.state = this.states.PLAYING;
    return true;
  }

  playerAdd(name) {
    // if(this.state !== this.states.WAITING || !this.players.includes(name)) {
    //   return false;
    // }
    let admin = this.isPlayerNameAdmin(name);
    let p = new Player(name, this.room, admin);
    this.players.push(p);
    console.log("playerJoin() name=" + name + " room=" + this.room + ". totalplayers=" + this.players.length); // + " players=" + this.players);
    // return true;
    return p;
  }
  playerRemoveByName(name) {
    this.players = this.players.filter((p) => 
      p.name !== name
    );
  }
  getPlayerByName(name) {
    return this.players.find(p => (p.name === name));
  }
  getPlayerNames() {
    return this.players.map(p => p.name);
  }
  isPlayerNameAdmin(name) {
    return name.includes("than"); // This could instead be the first person to join. It should be more robust
  }
  isPlayerAdmin(player) {
    return player.admin;
  }

  // generateFirstTasks() {
  //   for (let i = 0; i < this.players.length; i++) {
  //     const player = this.players[i];
  //     player.tasks.push(new CaptionTask(player, null));
  //   }
  // }

  getTaskJson(task) {
    if(task.caption === undefined && task.drawing === undefined) {
      return {
        "type": "taskCaptionInitial",
      };
    } else if(task.caption === undefined) {
      return {
        "type": "taskCaption",
        "drawing": task.drawing,
      };
    } else { // if(task.drawing === undefined) {
      return {
        "type": "taskDraw",
        "caption": task.caption,
      };
    }
  }

  getNextTask(player) {
    if(player.tasks.length === 0) { // This is the first game round, so everyone captions
      let t = new Task(player, undefined, undefined);
      player.tasks.push(t);
      return t;
    } else {
      // TODO generate the next task if it's not the first task
      console.log("Someone wants a new task");
      return "asdf getNextTask";
    }
  }

  taskFinish(player, socketData) {
    console.log("Someone finished a task");
  }

}


class Player {

  constructor(name, room, admin) {
    this.name = name;
    this.room = room;
    this.admin = admin;
    // this.status = this.status.BUSY;

    this.tasks = [];
    // this.taskResults = [];
  }

  toString() { // This may not work
    return "Player name=" + this.name;
  }

}

class Task {
  constructor(owner, caption, drawing) {
    this.owner = owner;
    this.completer = undefined;

    this.caption = caption;
    this.drawing = drawing;

    // this.typeName = typeName;
  }
}


module.exports = { Game, Player, Task }
