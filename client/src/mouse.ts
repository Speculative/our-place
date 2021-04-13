import { unstable_batchedUpdates } from "react-dom";
import { usePosition } from "./store";

export function registerMousePosition() {
  window.addEventListener("mousemove", function (e) {
    const { moveMouse } = usePosition.getState();
    unstable_batchedUpdates(() => moveMouse(e.clientX, e.clientY));
  });
}
