import { styleBlock } from "./utilities";

export const hostStyle = styleBlock("host", {
    margin: "0",
    padding: "0",
    minWidth: "100px",
    minHeight: "100px",
    display: "block",
    position: "relative",
    borderRadius: "3px",
    overflow: "hidden"
});

export const canvasStyle = styleBlock("host > canvas", {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: "0",
    left: "0"
});

export const resizerStyle = styleBlock("host > object", {
    display: "block",
    position: "absolute",
    top: "0",
    left: "0",
    height: "100%",
    width: "100%",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: "-1"
});