import React from "react";
import Canvas from "./components/canvas";
import "./App.css";

function App() {
    return (
        <div className="App">
            <h1>Conway's Game of Life</h1>
            <Canvas />
        </div>
    );
}

export default App;
