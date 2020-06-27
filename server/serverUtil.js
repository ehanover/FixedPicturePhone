
class Game {

  states = {
    WAITING: 0,
    PLAYING: 1,
    OVER: 2
  };

  constructor(roomId) {
    console.log("Game() new game id=" + roomId);
    this.room = roomId;
    this.players = [];
    this.state = this.states.WAITING;
  }

  playerJoin(name) {
    // if(this.state !== this.states.WAITING || this.players.includes(name)) {
    //   return false;
    // }
    this.players.push(new Player(name, this.room));
    console.log("playerJoin() name=" + name + " room=" + this.room + ". totalplayers=" + this.players.length); // + " players=" + this.players);
    // return true;
  }
  playerRemoveByName(name) {
    this.players = this.players.filter((p) => 
      p.name !== name
    );
  }
  getPlayerNames() {
    return this.players.map(p => p.name);
  }

}


class Player {

  constructor(name, room) {
    this.admin = name.includes("than"); // this could instead be the first person to join
    this.name = name;
    this.room = room;
  }

  toString() { // This may not work
    return "Player name=" + this.name;
  }

}

module.exports = { Game, Player }
