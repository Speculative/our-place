import { useEffect } from "react";
import { observer } from "mobx-react-lite";

import {
  selfPosition,
  roommateStatuses,
  camera,
  worldMouse,
  selfAudio,
  selfDress,
  Hats,
  Mouths,
} from "./store";

import { registerHotkeys } from "./hotkeys";
import { registerMousePosition } from "./mouse";
import { setupSocket } from "./socket";
import { registerWindowSize } from "./window";
import { registerSelfAudio } from "./mediaCapture";

import { Roommate } from "./Roommate";
import { Grid } from "./Grid";

import "./index.css";

export const Room = observer(() => {
  useEffect(() => {
    registerWindowSize();
    registerHotkeys();
    registerMousePosition();
    setupSocket();
    registerSelfAudio();
  }, []);
  const { cameraMinX, cameraMinY, cameraWidth, cameraHeight } = camera.get();
  const { mouseX, mouseY } = worldMouse.get();

  return (
    <svg
      viewBox={`${cameraMinX} ${cameraMinY} ${cameraWidth} ${cameraHeight}`}
      className="rootSvg"
    >
      <Grid />
      {Array.from(roommateStatuses.statuses.entries()).map(
        ([id, { pos, mouse, audio }]) => (
          <Roommate
            x={pos.x}
            y={pos.y}
            mouseX={mouse.x}
            mouseY={mouse.y}
            loudness={audio.loudness}
            mouth={Mouths.Fuji}
            hat={Hats.Tangie}
            key={id}
          />
        )
      )}
      <Roommate
        x={selfPosition.x}
        y={selfPosition.y}
        mouseX={mouseX}
        mouseY={mouseY}
        mouth={selfDress.mouth}
        hat={selfDress.hat}
        loudness={selfAudio.loudness}
      />
    </svg>
  );
});
