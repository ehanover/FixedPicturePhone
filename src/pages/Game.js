import './Game.css';
// import { useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import configClient from '../configClient.json';
import io from 'socket.io-client';
import MyCanvas from '../components/MyCanvas';

// const socket = io(configClient.serverUrl);
export default function Game(props) {

  // const history = useHistory();
  const [socket, setSocket] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [captionText, setCaptionText] = useState("");
  const name = sessionStorage.getItem("name");
  const canvasSize = Math.min(650, parseInt( (window.innerWidth < 800) ? window.innerWidth*0.90 : window.innerWidth*0.45));

  useEffect(() => {
    setSocket(io(configClient.serverUrl));
    // return () => ((socket !== null) ? socket.disconnect() : null); // This conflicts with manual disconnection
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if(!socket) return;
    // console.log("useEffect() socket binding, currentTask=" + currentTask);

    socket.on("connect", () => {
      // console.log("waiting for gameConnect");
      // setTimeout(() => socket.emit("gameConnect", {"name": name}), 100);
      socket.emit("gameConnect", {"name": name});
      // console.log("done with gameConnect");
    });
    socket.on("gameTaskNew", (data) => {
      console.log("socket updating currentTask");
      setCurrentTask(data.task);
    });
    socket.on("gameTaskShouldRequestUpdate", () => {
      console.log("socket requesting a new task");
      socket.emit("gameTaskRequestUpdate");
    });
    socket.on("gameOver", () => {
      console.log("GAME OVER!");
      // socket.disconnect();
      // history.push("/results");
      // window.location.replace("/results");
      window.location = "/results";
    });
    socket.on("disconnect", () => {

    });
  // eslint-disable-next-line
  }, [socket]);


  function taskSubmit(data) {
    let taskToSubmit = currentTask;
    updateAfterSubmit();
    if(taskToSubmit.type === "taskCaptionInitial" || taskToSubmit.type === "taskCaption") {
      console.log("taskSubmit() submitting caption=" + data);
      socket.emit("gameTaskFinish", {"name": name, "caption": data, "id": taskToSubmit.id, "type": taskToSubmit.type});
    } else if(taskToSubmit.type === "taskDraw") {
      console.log("taskSubmit() submitting drawing");
      socket.emit("gameTaskFinish", {"name": name, "drawing": data, "id": taskToSubmit.id, "type": taskToSubmit.type});
    } else {
      console.log("taskSubmit() ERROR submitting invalid task");
    }
  }

  function updateAfterSubmit() {
    // console.log("updateAfterSubmit()");
    setCaptionText("");
    setCurrentTask(null);
  }

  function renderTask() {
    console.log("renderTask() with type=" + currentTask.type);
    if(currentTask.type === "taskCaptionInitial") 
      return <div>
          <p>Enter a funny caption that someone will have to draw: </p>
          <input id="taskCaption-text" className="captionInput" type="text" size="25" onChange={(e) => setCaptionText(e.target.value)} />
          <br />
          <button onClick={() => taskSubmit(captionText)} className="pure-button pure-button-primary">Submit</button>
        </div>;

    if(currentTask.type === "taskCaption")
      return <div>
          <p>Write a caption for this drawing: </p>
          <MyCanvas drawing={currentTask.drawing} size={canvasSize} />
          <input id="taskCaption-text" className="captionInput" type="text" size="25" onChange={(e) => setCaptionText(e.target.value)} />
          <br />
          <button onClick={() => taskSubmit(captionText)} className="pure-button pure-button-primary">Submit</button>
        </div>;

    if(currentTask.type === "taskDraw") 
      return <div>
          <p>Make a drawing that has this caption: </p>
          <p><i>{currentTask.caption}</i></p>
          <MyCanvas onSubmit={(d) => taskSubmit(d)} size={canvasSize} />
        </div>;

    return <p>ERROR no match for task render</p>;
  }


  return (
    <div className="Game">
      <p>Game in progress</p>

      {(currentTask !== null) ? renderTask() : <p>Waiting for other players to finish their tasks...</p>}

      <br />
    </div>
  );
}
