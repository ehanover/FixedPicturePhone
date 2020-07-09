import './Lobby.css';
// import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import clientConfig from '../configClient.json';
import io from 'socket.io-client';


export default function Lobby(props) {

  const history = useHistory();
  // eslint-disable-next-line
  // const [cookie, setCookie, removeCookie] = useCookies();
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState(["Loading..."]);
  // const name = cookie.name;
  // const admin = cookie.admin;
  const name = sessionStorage.getItem("name");
  const admin = sessionStorage.getItem("admin");

  // console.log("Lobby my name is " + name);
  useEffect(() => {
    setSocket(io(clientConfig.serverUrl));
  }, []);

  useEffect(() => {
    if(!socket) return;

    socket.on("connect", () => {
      socket.emit("lobbyConnect", {"name": name});
    });
    socket.on("lobbyUpdate", (data) => {
      setPlayers(data.players);
    });
    socket.on("lobbyFinish", (data) => {
      // console.log("game is starting");
      socket.disconnect();
      history.push("/game")
    });
    socket.on("disconnect", () => {

    });
    return () => socket.disconnect();
  // eslint-disable-next-line
  }, [socket]); // is all this running a bunch of times? related to events

  let adminControls;
  if(admin === "true") {
    adminControls = <button onClick={adminControlsStart} className="pure-button pure-button-primary">Start game</button>
  } else {
    adminControls = <p>Waiting for the leader to start the game...</p>;
  }

  function adminControlsStart(e) {
    axios.post(clientConfig.serverUrl + "/lobbyFinishRequest", {"name": name});
  }

  return (
    <div className="Room">
      <h3>Players in the lobby:</h3>
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
