import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import About from './pages/About.js';
import Game from './pages/Game.js';
import Home from './pages/Home.js';
import React from 'react';
import Room from './pages/Room.js';

export default function App() {
  return (
    <div className="App">
      <div className="router-content">
        <Router>
          <Switch>
            <Route path="/about" children={<About />} />
            <Route path="/room/:room" children={<Room />} />
            <Route path="/game/:room" children={<Game />} />
            <Route path="/" children={<Home />} />
          </Switch>
        </Router>
      </div>
    </div>
  );
}
