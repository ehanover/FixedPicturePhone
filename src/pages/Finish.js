import './Finish.css';
import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react'; // TODO organize imports, esp useEffect/useState ordering
import axios from 'axios';
import clientConfig from '../configClient.json';
import MyCanvas from '../components/MyCanvas';

export default function Finish() {

  const [results, setResults] = useState(null);
  const canvasSize = Math.min(550, parseInt( (window.innerWidth < 800) ? window.innerWidth*0.80 : window.innerWidth*0.35));

  useEffect(() => {
    console.log("Finish.js loading game over results");
    axios.get(clientConfig.serverUrl + "/results")
      .then(res => {
        setResults(res.data);
      })
      .catch(err => {
        console.log("Finish.js ERROR loading results: " + err);
      });

  }, []);

  function renderResults() {
    if(results === null) return <p>Loading...</p>;

    return <div>
      {results.taskSequences.map(function (s, i) {
        return <div key={i}>
          <hr />
          <h2>Book #{i+1}</h2>
          {s.completerNames.map(function (n, i) {
            let iMod = i % 2;
            if(iMod === 0) { // Caption
              return <div>
                {i === 0 ? 
                  <p className="TaskLabel">Starting caption by <span className="PlayerName">{n}</span>:</p> : 
                  <p className="TaskLabel">Caption by <span className="PlayerName">{n}</span>:</p>
                }
                <h3 className="TaskCaption">"<i>{s.captions[Math.floor(i/2)]}</i>"</h3>
              </div>;
            } else if(iMod === 1) { // Drawing
              return <div>
                <p className="TaskLabel">Drawing by <span className="PlayerName">{n}</span>:</p>
                <MyCanvas drawing={s.drawings[Math.floor(i/2)]} size={canvasSize} />
              </div>;
            } else {
              return <p>renderResults() ERROR</p>;
            }
          })}
          <br />
        </div>;
      })}
    </div>;
  }

  return (
    <div className="Finish">
      <h4>The game is over! Let's see everyone's drawings.</h4>
      <br />
      {renderResults()}
      <br />
      <br />
      <br />
      <br />
      <br />
      <Link to="/">Exit</Link>
      <br />
    </div>
  );
}
