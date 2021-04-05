import { useEffect } from "react";
import { usePosition, useRoommatePositions } from "./store";
import { registerHotkeys } from "./hotkeys";
import { setupSocket } from "./socket";

import "./index.css";

const rootBox = `0 0 ${window.innerWidth} ${window.innerHeight}`;

export function Room() {
  const [x, y] = usePosition((state) => [state.x, state.y]);
  const roommatePositions = useRoommatePositions((state) => state.positions);
  useEffect(() => {
    registerHotkeys();
    setupSocket();
  }, []);

  return (
    <svg viewBox={rootBox} className="rootSvg">
      <circle cx={x} cy={y} r={20} fill="white" data-self={true} />

      {Object.entries(roommatePositions).map(([id, { x, y }]) => (
        <circle cx={x} cy={y} r={20} fill="white" key={id} data-roommate={id} />
      ))}
    </svg>
  );
}
