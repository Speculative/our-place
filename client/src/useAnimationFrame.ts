import React from "react";

// https://css-tricks.com/using-requestanimationframe-with-react-hooks/
export const useAnimationFrame = (
  callback: (dt: number, time: number) => void
) => {
  const requestRef = React.useRef<number>();
  const previousTimeRef = React.useRef<number>();

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime, time);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line
  }, []);
};
