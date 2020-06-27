import './Home.css';
// import { Link } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import clientConfig from '../configClient.json';

export default function Home() {

  const history = useHistory();
  const [name, setName] = useState("bob");
  const [roomCode, setRoomCode] = useState("ABCD");
  // eslint-disable-next-line
  const [cookie, setCookie, removeCookie] = useCookies(); // re-render on every cookie change

  function formSubmit(e) {
    e.preventDefault();
    console.log("Home.js formSubmit()");
    axios.post(clientConfig.serverUrl + "/home", {"name": name, "roomCode": roomCode}
      // , {
      //   "Access-Control-Allow-Origin": "*",
      //   "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
      // }
      ).then(res => {
        setCookie("name", name);
        history.push("/lobby");
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
      <h1><u>FixedPicturePhone</u></h1>
      <br />

      <form className="pure-form pure-form-stacked" onSubmit={formSubmit}>
        <fieldset>
          <label htmlFor="text-name">Name: </label>
          <input type="text" id="text-name" maxLength="10" size="10" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br />

          <label htmlFor="text-room">Room code: </label>
          <input type="text" id="text-room" maxLength="4" size="8"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />

          <br />
          <br />
          <button id="button-join" type="submit" className="pure-button pure-button-primary">Join game</button>
        </fieldset>
      </form>

    </div>
  );
}
