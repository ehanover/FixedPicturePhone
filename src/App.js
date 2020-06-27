import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import About from './pages/About.js';
import Game from './pages/Game.js';
import Home from './pages/Home.js';
import Lobby from './pages/Lobby.js';
import React from 'react';

export default function App() {
  return (
    <div className="App">
      <div className="router-content">
        <Router>
          <Switch>
            <Route path="/lobby" children={<Lobby />} />
            <Route path="/game" children={<Game />} />
            <Route path="/about" children={<About />} />
            <Route path="/" children={<Home />} />
          </Switch>
        </Router>
      </div>
    </div>
  );
}
