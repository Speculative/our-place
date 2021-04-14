import { viewportMouse } from "./store";

export function registerMousePosition() {
  window.addEventListener("mousemove", function (e) {
    viewportMouse.move(e.clientX, e.clientY);
  });
}
