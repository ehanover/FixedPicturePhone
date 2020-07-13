import './MyCanvas.css';
import React, { useEffect, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import LZString from 'lz-string';

export default function MyCanvas(props) {

  const width = props.size;
  const height = width;
  const drawMode = (props.drawing === undefined || props.drawing === null);
  const colorList = ["#000000", "#888888", "#FFFFFF", "#FE2712", "#FB9902", "#FFF832", "#66B032", "#0247FE", "#8601AF", "#FF00FF"];
  const [canvas, setCanvas] = useState(undefined);
  const [radius, setRadius] = useState(5);
  const [color, setColor] = useState(colorList[0]);

  useEffect(() => {
    if(!drawMode && canvas !== undefined) {
      setData(props.drawing);
      // TODO allow scrolling when not in drawMode
    }
  // eslint-disable-next-line
  }, [canvas]);

  function onSubmit(e) {
    props.onSubmit(getData());
  }
  function getData() {
    // Original way to serialize canvas: https://stackoverflow.com/questions/30758228
    return LZString.compress(canvas.getSaveData());
  }
  function setData(s) {
    // console.log("MyCanvas setData(), string=" + s);
    let d = LZString.decompress(s);
    canvas.loadSaveData(d, false);
  }


  function colorButton(color, i) {
    return <input
      type="button"
      key={i}
      className="pure-u-1-24 controlColorButton"
      style={{backgroundColor: color}}
      onClick={e => setColor(color)}
    />
  }

  return (
    <div>
      <CanvasDraw 
        className="myCanvas"
        ref={c => (setCanvas(c))}
        brushRadius={radius}
        brushColor={color}
        lazyRadius={0}
        canvasWidth={width}
        canvasHeight={height}
        // loadTimeOffset={5}
        immediateLoading={true} // Insta-load is probably better (erasing would be bad)
        disabled={!drawMode}
      />

      {drawMode 
        ? <div className="controls">
            <br />
            <div className="pure-g">
              {colorList.map((c, i) => colorButton(c, i))}
              <div className="pure-u-14-24">
                <input type="range" min="2" max="40" onChange={(e) => setRadius(parseInt(e.target.value))} value={radius} className="controlSlider"/>
              </div>

              <div className="pure-u-1-2">
                <button className="pure-button" onClick={() => canvas.clear()}>Clear</button>
              </div>
              <div className="pure-u-1-2">
                <button className="pure-button" onClick={() => canvas.undo()}>Undo</button>
              </div>
            </div>
            <button onClick={onSubmit} className="pure-button pure-button-primary">Submit</button>

          </div>
        : null // <div className="clickBlocker" onClick={e => e.stopPropagation()}></div>
      }

    </div>
  );
}
