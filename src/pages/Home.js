import './Home.css';
// import { Link } from "react-router-dom";
import React, { useState } from 'react';

export default function Home() {

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  function formSubmit(e) {
    e.preventDefault();
    console.log("Starting game...");
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
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />

          <br />
          <br />
          <button id="button-join" type="submit" className="pure-button pure-button-primary">Join game</button>
        </fieldset>
      </form>

    </div>
  );
}
