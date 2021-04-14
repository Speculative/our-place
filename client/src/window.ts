import { windowSize } from "./store";

export function registerWindowSize() {
  window.addEventListener("resize", () =>
    windowSize.resize(window.innerWidth, window.innerHeight)
  );
}
