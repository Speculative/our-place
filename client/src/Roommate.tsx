import { useSpring, animated } from "react-spring";

interface RoommateProps {
  x: number;
  y: number;
  mouseX: number;
  mouseY: number;
}

export function Roommate({ x, y, mouseX, mouseY }: RoommateProps) {
  const dx = (mouseX ?? x) - x;
  const dy = (mouseY ?? y) - y;
  const theta = Math.atan2(dx, dy) - Math.PI / 2;
  const r = Math.sqrt(dx * dx + dy * dy);
  const fx = Math.min(r, 10) * Math.cos(theta);
  const fy = -1 * Math.min(r, 10) * Math.sin(theta);

  const { cxy } = useSpring({
    cxy: [fx, fy],
    config: { mass: 1, tension: 500, friction: 10, clamp: true },
  });

  return (
    <g viewBox="0 0 20 20" transform={`translate(${x}, ${y})`}>
      <circle r={20} fill="white" />
      <animated.g
        transform={cxy.to((cx, cy) => `translate(${cx - 4} ${cy - 2})`)}
      >
        <circle cx={0} cy={0} r={2} fill="black" />
        <circle cx={8} cy={0} r={2} fill="black" />
      </animated.g>
    </g>
  );
}
