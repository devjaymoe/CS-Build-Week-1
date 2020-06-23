import React, { useState, useCallback, useRef } from "react";
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

function App() {
    const [grid, setGrid] = useState(() => {
        return generateEmptyGrid();
    });

    const [running, setRunning] = useState(false);

    const [gen, setGen] = useState(0);

    // used in conjunction with run simulation
    // so that the state is up to date on the callback
    const runningRef = useRef(running);
    runningRef.current = running;

    // generation tracker used with ref hook
    // for the same reasons running ref is used
    const genRef = useRef(gen);
    genRef.current = gen;

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
                        let neighbors = 0;
                        operations.forEach(([x, y]) => {
                            const newI = i + x;
                            const newJ = j + y;
                            // checking the bounds
                            if (
                                newI >= 0 &&
                                newI < numRows &&
                                newJ >= 0 &&
                                newJ < numCols
                            ) {
                                // if we have a live cell its going to add 1 to the neighbors
                                neighbors += g[newI][newJ];
                            }
                        });

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

        setTimeout(runSimulation, 500);
    }, []);

    return (
        <>
            <button
                onClick={() => {
                    // changes running state
                    setRunning(!running);
                    if (!running) {
                        runningRef.current = true;
                        runSimulation();
                    }
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
                }}
            >
                Clear
            </button>
            <span>Current Generation: {gen}</span>
            <div
                className="App"
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
                                    ? "pink"
                                    : undefined,
                                border: "solid 1px black",
                            }}
                        />
                    ))
                )}
            </div>
        </>
    );
}

export default App;
