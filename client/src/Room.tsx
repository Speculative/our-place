import { useEffect } from "react";
import { observer } from "mobx-react-lite";

import { selfPosition, roommatePositions, camera, worldMouse } from "./store";
import { registerHotkeys } from "./hotkeys";
import { registerMousePosition } from "./mouse";
import { setupSocket } from "./socket";
import { registerWindowSize } from "./window";
import { Roommate } from "./Roommate";
import { Grid } from "./Grid";
import { getAudioStream } from "./mediaCapture";

import "./index.css";

export const Room = observer(() => {
  useEffect(() => {
    registerWindowSize();
    registerHotkeys();
    registerMousePosition();
    setupSocket();
    getAudioStream();
  }, []);
  const { cameraMinX, cameraMinY, cameraWidth, cameraHeight } = camera.get();
  const { mouseX, mouseY } = worldMouse.get();

  return (
    <svg
      viewBox={`${cameraMinX} ${cameraMinY} ${cameraWidth} ${cameraHeight}`}
      className="rootSvg"
    >
      <Grid />
      {Array.from(roommatePositions.positions.entries()).map(
        ([id, { pos, mouse }]) => (
          <Roommate
            x={pos.x}
            y={pos.y}
            mouseX={mouse.x}
            mouseY={mouse.y}
            key={id}
          />
        )
      )}
      <Roommate
        x={selfPosition.x}
        y={selfPosition.y}
        mouseX={mouseX}
        mouseY={mouseY}
      />
    </svg>
  );
});
