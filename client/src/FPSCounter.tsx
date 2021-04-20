import { useState } from "react";
import classNames from "classnames";
import { useAnimationFrame } from "./useAnimationFrame";

import styles from "./FPSCounter.module.css";

let dropHold = 0;

export function FPSCounter() {
  const [frames, setFrames] = useState([] as number[]);

  useAnimationFrame((dt, t) => {
    if (dt > 19) {
      dropHold = 4;
    } else if (dropHold > 0) {
      dropHold -= 1;
    }

    setFrames((prevFrames) => {
      const dropTo = prevFrames.findIndex((ft) => t - ft <= 1000);
      return [...prevFrames.slice(Math.max(0, dropTo)), t];
    });
  });

  const fps = frames.length;

  return (
    <span
      className={classNames(styles.fpsCounter, {
        [styles.droppedFrame]: dropHold > 0,
      })}
    >
      {fps}
    </span>
  );
}
