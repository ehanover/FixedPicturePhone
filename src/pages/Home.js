import './Home.css';
// import { Link } from "react-router-dom";
// import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import clientConfig from '../configClient.json';

export default function Home() {

  const history = useHistory();
  const [name, setName] = useState("1");
  const [roomCode, setRoomCode] = useState("ABCD");
  // const [redirect, setRedirect] = useState(false);
  // const [cookie, setCookie, removeCookie] = useCookies(); // re-render on every cookie change

  function formSubmit(e) {
    e.preventDefault();
    console.log("Home.js formSubmit()");
    axios.post(clientConfig.serverUrl + "/lobbyJoin", {"name": name, "roomCode": roomCode}
      ).then(res => {
        // console.log("Home.js trying to redirect");
        // setCookie("name", name);
        // setCookie("room", roomCode);
        // setCookie("admin", res.data.admin.toString());
        sessionStorage.setItem("name", name);
        sessionStorage.setItem("admin", res.data.admin.toString());
        history.push("/lobby");
        // setRedirect(true);
      }).catch(err => {
        if(err.response.status === 400) {
          alert(err.response.data.message);
        } else {
          console.log("Home.js POST error err=" + err);
        }
      }
    );
  }

  // if(redirect)
  //   return <Redirect to={{"pathname": "/lobby", "state": {"name": name}}} />;

  return (
    <div className="Home">
      <h1><u>FixedPicturePhone</u></h1>
      <br />

      <form className="pure-form pure-form-stacked" onSubmit={formSubmit}>
        <fieldset>
          <label htmlFor="text-name">Name: </label>
          <input type="text" id="text-name" maxLength="10" size="10" 
            value={name}
            onChange={(e) => setName(e.target.value)} // TODO disallow emojis?
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

    </div>
  );
}
