import './Game.css';
import React, { useState, useEffect } from 'react';
import clientConfig from '../configClient.json';
import io from 'socket.io-client';
import MyCanvas from '../components/MyCanvas';

// const socket = io(clientConfig.serverUrl);
export default function Game(props) {

  const [socket, setSocket] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [captionText, setCaptionText] = useState("");
  const name = sessionStorage.getItem("name");

  useEffect(() => {
    setSocket(io(clientConfig.serverUrl));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if(!socket) return;
    // console.log("useEffect() socket binding, currentTask=" + currentTask);

    socket.on("connect", () => {
      socket.emit("gameConnect", {"name": name});
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
      // TODO navigate to a new screen
    });
    socket.on("disconnect", () => {

    });
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
          <input id="taskCaption-text" type="text" size="25" onChange={(e) => setCaptionText(e.target.value)} />
          <br />
          <button onClick={() => taskSubmit(captionText)} className="pure-button pure-button-primary">Submit</button>
        </div>;

    if(currentTask.type === "taskCaption")
      return <div>
          <p>Write a caption for this drawing: </p>
          <MyCanvas drawing={currentTask.drawing} />
          <input id="taskCaption-text" type="text" size="25" onChange={(e) => setCaptionText(e.target.value)} />
          <br />
          <button onClick={() => taskSubmit(captionText)} className="pure-button pure-button-primary">Submit</button>
        </div>;

    if(currentTask.type === "taskDraw") 
      return <div>
          <p>Make a drawing that has this caption: </p>
          <p><i>{currentTask.caption}</i></p>
          <MyCanvas onSubmit={(d) => taskSubmit(d)}/>
        </div>;

    return <p>No match for task render</p>;
  }


  return (
    <div className="Game">
      <p>Game in progress</p>

      {(currentTask !== null) ? renderTask() : <p>Waiting for other players to finish their tasks...</p>}

      <br />
    </div>
  );
}
