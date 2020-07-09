// import './Home.css';
import React from 'react';
// import CanvasDraw from 'react-canvas-draw';
// import LZString from 'lz-string';
import MyCanvas from '../components/MyCanvas';


export default function Test() {

  // const [canvas, setCanvas] = useState(undefined);
  // const [radius, setRadius] = useState(2);
  // const [color, setColor] = useState("#FF00FF");
  // const height = 500;
  // const width = 500;

  // if(canvas)
  //   console.log(canvas.getData());
  // function compressString(s) {
  //   return LZString.compress(s);
  // }

  return (
    <div>
      <p>Test page</p>
      <MyCanvas onSubmit={(d) => console.log(d)}/>
      {/* <CanvasDraw 
        ref={c => (setCanvas(c))}
        brushRadius={radius}
        brushColor={color}
        lazyRadius={0}
        canvasHeight={height}
        canvasWidth={width}
      />

      <button onClick={() => canvas.undo()}>Undo</button>
      <button onClick={() => canvas.clear()}>Clear</button>
      <button onClick={() => console.log(compressString(canvas.getSaveData()))}>Print data</button> */}

    </div>
  );
}
