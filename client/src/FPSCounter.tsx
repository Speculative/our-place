import { useState } from "react";
import { useAnimationFrame } from "./useAnimationFrame";

import styles from "./FPSCounter.module.css";

export function FPSCounter() {
  const [frames, setFrames] = useState([] as number[]);

  useAnimationFrame((dt, t) => {
    setFrames((prevFrames) => {
      const dropTo = prevFrames.findIndex((ft) => t - ft <= 1000);
      if (dt > 17) {
        console.log(dt);
      }
      return [...prevFrames.slice(Math.max(0, dropTo)), t];
    });
  });

  const fps = frames.length;

  return <span className={styles.fpsCounter}>{fps}</span>;
}
