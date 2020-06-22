import React, { useRef, useState } from "react";
import { useAnimeFrame } from "./customHooks/useAnimeFrame.js";
import moment from "moment";

const Canvas = (props) => {
    const canvasRef = useRef(null);

    const [stopAnimation, setStopAnimation] = useState(false);

    const doAnimation = (elapsedTime) => {
        console.log("elapsed time:", elapsedTime);
        console.log(canvasRef.current);
    };

    const [cancelAnimationFrame] = useAnimeFrame(moment.now(), doAnimation);

    /**
     * Render the canvas
     */
    return <canvas ref={canvasRef} width={props.width} height={props.height} />;
};

export default Canvas;
