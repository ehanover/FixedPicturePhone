// import './Home.css';
import React, { useEffect, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
// import props from 'prop-types';
import LZString from 'lz-string';

export default function MyCanvas(props) {

  const [canvas, setCanvas] = useState(undefined);
  const [radius, setRadius] = useState(2);
  const [color, setColor] = useState("#FF00FF");
  const height = 400;
  const width = 400;
  const drawMode = (props.drawing === undefined || props.drawing === null);

  useEffect(() => {
    if(!drawMode && canvas !== undefined) {
      setData(props.drawing);
    }
  }, [canvas]);

  function onSubmit(e) {
    props.onSubmit(getData());
  }
  function getData() {
    // Original way to serialize canvas: https://stackoverflow.com/questions/30758228
    return LZString.compress(canvas.getSaveData());
  }
  function setData(s) {
    console.log("MyCanvas setData(), string=" + s);
    let d = LZString.decompress(s);
    canvas.loadSaveData(d, false);
  }

  return (
    <div>
      {/* <p>A Canvas</p> */}
      <CanvasDraw 
        ref={c => (setCanvas(c))}
        brushRadius={radius}
        brushColor={color}
        lazyRadius={0}
        canvasHeight={height}
        canvasWidth={width}
        loadTimeOffset={5} // Might have to turn this off and insta-load (erasing would be bad)
        disabled={!drawMode}
      />

      {drawMode 
        ? <div>
            <button onClick={() => canvas.undo()}>Undo</button>
            <button onClick={() => canvas.clear()}>Clear</button>
            <br />
            <button onClick={onSubmit} className="pure-button pure-button-primary">Submit</button>
          </div>
        : null
      }

      {/* <canvas id="myCanvas" width="500" height="500"></canvas> */}
      {/* <Stage width={500} height={500}>
        <Layer onMouseDown={MyMouseDown}>
          <Image />
          <Rect on/>
        </Layer>
      </Stage> */}
    </div>
  );
}
