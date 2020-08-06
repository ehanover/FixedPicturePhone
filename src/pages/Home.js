import './Home.css';
// import { useHistory } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import clientConfig from '../configClient.json';

export default function Home() {

  // const history = useHistory();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("ABCD");

  function formSubmit(e) {
    e.preventDefault();
    console.log("Home.js formSubmit()");
    if(name.length <= 0 || roomCode.length <= 0)
      return;

    axios.post(clientConfig.serverUrl + "/lobbyJoin", {"name": name, "roomCode": roomCode}
      ).then(res => {
        // console.log("Home.js trying to redirect");
        sessionStorage.setItem("name", res.data.nameReturn);
        sessionStorage.setItem("admin", res.data.admin.toString());
        // history.push("/lobby");
        window.location.replace("lobby");
      }).catch(err => {
        if(err.response.status === 400) {
          alert(err.response.data.message);
        } else {
          console.log("Home.js POST error err=" + err);
        }
      }
    );
  }

  return (
    <div className="Home">
      <h1><u><span className="PlayerName">Fixed</span>PicturePhone</u></h1>
      <br />

      <form className="pure-form pure-form-stacked" onSubmit={formSubmit}>
        <fieldset>
          <label htmlFor="text-name">Name: </label>
          <input type="text" id="text-name" maxLength="10" size="10" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br />

          <label htmlFor="text-room">Game password: </label>
          <input type="text" id="text-room" maxLength="4" size="8"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />

          <br />
          <br />
          <button id="button-join" type="submit" className="pure-button pure-button-primary">Join game</button>
        </fieldset>
      </form>

      <br />
      <p>Made by Ethan <span role="img" aria-label="smily face">😃</span></p>
      <p>July 2020</p>

    </div>
  );
}
