import { useEffect } from "react";
import { usePosition, useRoommatePositions, useRoom } from "./store";
import { registerHotkeys } from "./hotkeys";
import { registerMousePosition } from "./mouse";
import { setupSocket } from "./socket";
import { Roommate } from "./Roommate";
import { Grid } from "./Grid";
import { useCamera } from "./useCamera";
// import { getAudioStream } from "./mediaCapture";

import "./index.css";

export function Room() {
  useEffect(() => {
    registerHotkeys();
    registerMousePosition();
    setupSocket();
    // getAudioStream();
  }, []);

  const { x, y, mouseX, mouseY } = usePosition((state) => ({
    x: state.x,
    y: state.y,
    mouseX: state.mouseX,
    mouseY: state.mouseY,
  }));
  const roommatePositions = useRoommatePositions((state) => state.positions);
  const { roomWidth, roomHeight } = useRoom((state) => ({
    roomWidth: state.width,
    roomHeight: state.height,
  }));
  const { cameraMinX, cameraMinY, cameraWidth, cameraHeight } = useCamera();

  return (
    <svg
      viewBox={`${cameraMinX} ${cameraMinY} ${cameraWidth} ${cameraHeight}`}
      className="rootSvg"
    >
      <Grid width={roomWidth} height={roomHeight} spacing={80} />
      {Object.entries(roommatePositions).map(
        ([id, { x, y, mouseX, mouseY }]) => (
          <Roommate x={x} y={y} mouseX={mouseX} mouseY={mouseY} key={id} />
        )
      )}
      <Roommate x={x} y={y} mouseX={mouseX} mouseY={mouseY} />
    </svg>
  );
}
