import React, { useState, useCallback, useRef } from "react";
import { heartPreset } from "./presets/hearts.js";
import { pentaPreset } from "./presets/Penta-decathlon.js";
import { gliderGun } from "./presets/gliderGun.js";
import produce from "immer";

const numRows = 25;
const numCols = 45;

// all the neighbors for an element
const operations = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0],
];

const generateEmptyGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
        rows.push(Array.from(Array(numCols), () => 0));
    }

    return rows;
};
// function to check all neighbors in the sim loop
const countNeighbors = (grid, x, y) => {
    return operations.reduce((acc, [i, j]) => {
        const row = (x + i + numRows) % numRows;
        const col = (y + j + numCols) % numCols;
        acc += grid[row][col];
        return acc;
    }, 0);
};

const presetContainer = {
    Hearts: heartPreset,
    Penta: pentaPreset,
    Glider: gliderGun,
};

const speeds = {
    slow: 800,
    normal: 200,
    fast: 50,
};

function App() {
    const [grid, setGrid] = useState(() => {
        return generateEmptyGrid();
    });

    const [running, setRunning] = useState(false);

    const [gen, setGen] = useState(0);

    const [speed, setSpeed] = useState("normal");

    // used in conjunction with run simulation
    // so that the state is up to date on the callback
    const runningRef = useRef(running);
    runningRef.current = running;

    const speedRef = useRef(speed);
    speedRef.current = speed;

    const runSimulation = useCallback(() => {
        // kill command for recursive function
        // checks running state

        if (!runningRef.current) {
            return;
        }
        // generation incrementer
        setGen((genNum) => {
            return (genNum = genNum + 1);
        });

        // param is curr val of grid
        setGrid((g) => {
            // new val of grid returned
            return produce(g, (gridCopy) => {
                // simulate
                // double for loop to go through every value in the grid
                for (let i = 0; i < numRows; i++) {
                    for (let j = 0; j < numCols; j++) {
                        let neighbors = countNeighbors(g, i, j);

                        if (neighbors < 2 || neighbors > 3) {
                            // if this case current position dies
                            gridCopy[i][j] = 0;
                        } else if (g[i][j] === 0 && neighbors === 3) {
                            // if enough neighbors, makes a live cell
                            gridCopy[i][j] = 1;
                        }
                    }
                }
            });
        });

        setTimeout(runSimulation, speeds[speedRef.current]);
    }, []);

    const handleChange = (e) => {
        let presetName = e.target.value;

        if (presetName === "None") {
            setGrid(generateEmptyGrid());
        } else {
            setGrid(presetContainer[presetName]);
        }
    };

    const handleSpeed = (e) => {
        setSpeed(e.target.value);
    };

    return (
        <div className="mainContainer">
            <div className="title">
                <h1>Conway's Game of Life</h1>
                <p>Current Generation: {gen}</p>
            </div>
            <div
                className="gameGrid"
                style={{
                    // grid css
                    display: "grid",
                    gridTemplateColumns: `repeat(${numCols}, 20px)`,
                }}
            >
                {/* double map for cols and rows */}
                {grid.map((rows, i) =>
                    rows.map((col, k) => (
                        <div
                            key={`${i}-${k}`}
                            onClick={() => {
                                // make tiles not clickable while running
                                if (!running) {
                                    const newGrid = produce(
                                        grid,
                                        (gridCopy) => {
                                            gridCopy[i][k] = grid[i][k] ? 0 : 1;
                                        }
                                    );
                                    setGrid(newGrid);
                                }
                            }}
                            style={{
                                width: 20,
                                height: 20,
                                backgroundColor: grid[i][k]
                                    ? "#00adb5"
                                    : undefined,
                                border: "solid 1px black",
                            }}
                        />
                    ))
                )}
            </div>
            <div className="controls">
                <div className="speedContainer">
                    <label htmlFor="slow">
                        Slow
                        <input
                            type="radio"
                            id="slow"
                            name="speed"
                            value="slow"
                            onChange={handleSpeed}
                        />
                    </label>
                    <label htmlFor="normal">
                        Normal
                        <input
                            type="radio"
                            id="normal"
                            name="speed"
                            value="normal"
                            defaultChecked
                            onChange={handleSpeed}
                        />
                    </label>
                    <label htmlFor="fast">
                        Fast
                        <input
                            type="radio"
                            id="fast"
                            name="speed"
                            value="fast"
                            onChange={handleSpeed}
                        />
                    </label>
                </div>
                <div className="presetContainer">
                    <label htmlFor="presets">Presets</label>
                    <select
                        className="presets"
                        id="presets"
                        onChange={handleChange}
                    >
                        <option value="None">...</option>
                        <option value="Hearts">Hearts</option>
                        <option value="Penta">Penta- decathlon</option>
                        <option value="Glider">Gosper's Glider Gun</option>
                    </select>
                </div>
                <div className="buttonContainer">
                    <button
                        onClick={() => {
                            // changes running state
                            setRunning(!running);
                            if (!running) {
                                runningRef.current = true;
                                runSimulation();
                            }
                            console.log(grid);
                        }}
                    >
                        {/* checks running state and changes text */}
                        {running ? "Stop" : "Start"}
                    </button>
                    <button
                        onClick={() => {
                            const rows = [];
                            for (let i = 0; i < numRows; i++) {
                                rows.push(
                                    Array.from(Array(numCols), () =>
                                        Math.random() > 0.8 ? 1 : 0
                                    )
                                );
                            }

                            setGrid(rows);
                        }}
                    >
                        Randomize
                    </button>
                    <button
                        onClick={() => {
                            setGrid(generateEmptyGrid());
                            setGen(0);
                            setRunning(false);
                        }}
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
