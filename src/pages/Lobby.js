import './Lobby.css';
import { useCookies } from 'react-cookie';
import React, { useState, useEffect } from 'react';
import clientConfig from '../configClient.json';
import io from 'socket.io-client';

export default function Lobby() {

  // eslint-disable-next-line
  const [cookie, setCookie, removeCookie] = useCookies(); // re-render on every cookie change
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState(["Loading..."]);

  useEffect(() => {
    setSocket(io(clientConfig.serverUrl));
    // return () => {
    //   socket.disconnect();
    // }
  }, []);

  useEffect(() => {
    if(!socket) return;

    socket.on("connect", () => {
      // console.log("Lobby.js - socket connect");
      socket.emit("lobbyPlayerJoined", {"name": cookie.name});
    });
    socket.on("lobbyPlayersUpdate", (data) => { // Update the list of players in the room
      console.log("lobbyPlayersUpdate d.p=" + data.players);
      setPlayers(data.players);
    });
    socket.on("disconnect", () => {
      // console.log("Room.js - socket disconnect");
    });
  }, [socket, players, cookie]); // all this is running a ton of times?

  function adminControlsClick(e) {
    console.log("starting game");
  }

  let adminControls;
  if(cookie.name.includes("than")) {
    adminControls = <button onClick={adminControlsClick} className="pure-button pure-button-primary">Start game</button>
  } else {
    adminControls = null;
  }

  return (
    <div className="Room">
      <h3>Players in lobby:</h3>
      <ul>
        {players.map((p, i) =>
          <li key={i}>{p}</li>
        )}
      </ul>
      <br />
      {adminControls}
    </div>
  );
}
