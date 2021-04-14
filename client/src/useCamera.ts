// import { useState } from "react";
// import { useSpring } from "react-spring";

import { useWindowSize } from "./useWindowSize";
import { usePosition, useRoom } from "./store";

export function useCamera() {
  // const [[cameraX, cameraY], setCameraCenter] = useState([0, 0]);
  const { windowWidth, windowHeight } = useWindowSize();
  const { playerX, playerY } = usePosition((state) => ({
    playerX: state.x,
    playerY: state.y,
  }));
  const { roomWidth, roomHeight } = useRoom((state) => ({
    roomWidth: state.width,
    roomHeight: state.height,
  }));

  const xOff = windowWidth / 2;
  const yOff = windowHeight / 2;

  const targetCameraX =
    playerX - xOff < 0
      ? xOff
      : playerX + xOff > roomWidth
      ? roomWidth - xOff
      : playerX;

  const targetCameraY =
    playerY - yOff < 0
      ? yOff
      : playerY + yOff > roomHeight
      ? roomHeight - yOff
      : playerY;

  return {
    cameraMinX: targetCameraX - xOff,
    cameraMinY: targetCameraY - yOff,
    cameraWidth: windowWidth,
    cameraHeight: windowHeight,
  };
}
