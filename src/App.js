import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import About from './pages/About.js';
import Finish from './pages/Finish.js';
import Game from './pages/Game.js';
import Home from './pages/Home.js';
import Lobby from './pages/Lobby.js';
import Test from './pages/Test.js';
import React from 'react';

export default function App() {
  return (
    <div className="App">
      <div className="router-content">
        <Router>
          <Switch>
            <Route path="/lobby" children={<Lobby />} />
            <Route path="/game" children={<Game />} />
            <Route path="/results" children={<Finish />} />
            <Route path="/about" children={<About />} />
            <Route path="/test" children={<Test/>} />
            <Route path="/" children={<Home />} />
            {/* TODO rename Home to Join */}
          </Switch>
        </Router>
      </div>
    </div>
  );
}
