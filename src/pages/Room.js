import './Room.css';
import { useParams } from "react-router-dom";
import React from 'react';

export default function Room() {

  let { room } = useParams();

  return (
    <div className="Room">
      <h3>Players in room {room}</h3>
    </div>
  );
}
