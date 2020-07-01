import './Game.css';
import { useCookies } from 'react-cookie';
import React, { useState, useEffect } from 'react';
import clientConfig from '../configClient.json';
import io from 'socket.io-client';

// const socket = io(clientConfig.serverUrl);

export default function Game() {

  // eslint-disable-next-line
  const [cookie, setCookie, removeCookie] = useCookies();
  const [socket, setSocket] = useState(io(clientConfig.serverUrl));
  const [taskQueue, setTaskQueue] = useState([]);
  const name = cookie.name;
  // const admin = cookie.admin;

  useEffect(() => {
    // setSocket(io(clientConfig.serverUrl));
    // socket.emit("gameConnect", {"name": name});
    return () => {
      socket.disconnect();
    }
  }, []);

  useEffect(() => {
    if(!socket) return;

    socket.on("connect", () => {
      socket.emit("gameConnect", {"name": name});
    });
    socket.on("gameTaskUpdate", (data) => {
      if(data.name === name || data.name === "*") { // This update is relevant to me
        // console.log("Updating task queue...");
        setTaskQueue(taskQueue.concat([data.task]));
        // console.log("Queue was updated, taskQueue.length=" + taskQueue.length);
        // console.log("Queue was updated, queue[0].type=" + taskQueue[0].type);
      }
    });
    socket.on("disconnect", () => {

    });
  }, [socket]);

  function taskQueueSubmit() {
    let taskToSubmit = taskQueue[0];
    socket.emit("gameTaskFinish", {"name": name});
  }

  const taskCaptionInitial = <div>
    <p>Enter a funny caption that someone will have to draw</p>
    <input id="taskCaptionInitial-text" type="text" size="25"/>
  </div>;

  const taskCaption = <div>
    <p>Write a caption for this drawing: </p>
    <canvas id="taskCaption-canvas"></canvas>
    <input id="taskCaption-text" type="text" size="25"/>
  </div>;

  const taskDraw = <div>
    <p>Make a drawing with this caption: </p>
    <p><i>TODO caption</i></p>
    <canvas id="taskDraw-canvas"></canvas>
  </div>;
  // serialize canvas: https://stackoverflow.com/questions/30758228

  // let currentTask = <p>currentTask is null</p>;
  // console.log("queue=" + taskQueue);
  // if(taskQueue.length > 0) {
  //   let firstTaskType = taskQueue[0].type;
  //   console.log("ftt=" + firstTaskType);
  //   if(firstTaskType === "taskCaptionInitial") {
  //     currentTask = taskCaptionInitial;
  //   } else if(firstTaskType === "taskCaption") {
  //       currentTask = taskCaption;
  //   } else if(firstTaskType === "taskDraw") {
  //       currentTask = taskDraw;
  //   }
  // }
  // console.log("taskQueue.length=" + taskQueue.length);

  return (
    <div className="Game">
      <p>Game in progress</p>

      {(taskQueue.length > 1) ? <p>Tasks in queue: {taskQueue.length}</p> : <br />}

      {(taskQueue.length > 0) ? 
          taskQueue[0].type === "taskCaption" ? taskCaption :
            taskQueue[0].type === "taskDraw" ? taskDraw :
              taskQueue[0].type === "taskCaptionInitial" ? taskCaptionInitial : <p>Unknown taskS</p>
        : <p>too short</p>
      }

      <br />
      {(taskQueue.length === 0)
        ? <p>Waiting for other players to finish their tasks...</p>
        : <button onClick={taskQueueSubmit} className="pure-button pure-button-primary">Submit</button>
      }

    </div>
  );
}
