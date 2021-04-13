import { useEffect } from "react";
import { usePosition, useRoommatePositions } from "./store";
import { registerHotkeys } from "./hotkeys";
import { registerMousePosition } from "./mouse";
import { setupSocket } from "./socket";
import { Roommate } from "./Roommate";

import "./index.css";

export function Room() {
  const { x, y, mouseX, mouseY } = usePosition((state) => ({
    x: state.x,
    y: state.y,
    mouseX: state.mouseX,
    mouseY: state.mouseY,
  }));
  const roommatePositions = useRoommatePositions((state) => state.positions);
  useEffect(() => {
    registerHotkeys();
    registerMousePosition();
    setupSocket();
  }, []);
  const rootBox = `0 0 ${window.innerWidth} ${window.innerHeight}`;

  return (
    <svg viewBox={rootBox} className="rootSvg">
      <Roommate x={x} y={y} mouseX={mouseX} mouseY={mouseY} />

      {Object.entries(roommatePositions).map(
        ([id, { x, y, mouseX, mouseY }]) => (
          <Roommate x={x} y={y} mouseX={mouseX} mouseY={mouseY} key={id} />
        )
      )}
    </svg>
  );
}
