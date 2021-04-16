import { useSpring, animated } from "react-spring";
import { Hats, Mouths } from "./store";

interface RoommateProps {
  x: number;
  y: number;
  mouseX: number;
  mouseY: number;
  loudness: number;
  mouth: Mouths;
  hat: Hats;
}

export function Roommate({
  x,
  y,
  mouseX,
  mouseY,
  loudness,
  mouth,
  hat,
}: RoommateProps) {
  const dx = (mouseX ?? x) - x;
  const dy = (mouseY ?? y) - y;
  const theta = Math.atan2(dx, dy) - Math.PI / 2;
  const r = Math.sqrt(dx * dx + dy * dy);
  const fx = Math.min(r, 8) * Math.cos(theta);
  const fy = -1 * Math.min(r, 8) * Math.sin(theta);

  // Totally scientific and not at all empirically derived peak value.
  // Trust me, I definitely know what I'm doing.
  const scaledLoudness = Math.min(loudness, 150) / 150;

  // Triangle mouth
  const polyRadius = 4;
  const nSides = 3;
  const rotation = Math.PI / 6;
  const points = Array.from({ length: nSides }, (_, i) => i).map((i) => {
    const theta = i * ((2 * Math.PI) / nSides) + rotation;
    const px = polyRadius * scaledLoudness * Math.cos(theta);
    const py = polyRadius * scaledLoudness * Math.sin(theta);
    return [px, py] as [number, number];
  });

  const { cxy } = useSpring({
    cxy: [fx, fy],
    config: { mass: 1, tension: 500, friction: 10, clamp: true },
  });
  const [cx, cy] = cxy.get();

  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={20} fill="white" />
      <animated.g transform={`translate(${cx - 4} ${cy - 2})`}>
        <circle cx={0} cy={0} r={2} fill="black" />
        <circle cx={12} cy={0} r={2} fill="black" />
        {mouth === Mouths.Fuji ? (
          <polygon
            transform="translate(6 8)"
            points={points.map(([px, py]) => `${px},${py}`).join(" ")}
            fill="black"
          />
        ) : (
          <circle cx={6} cy={8} r={4 * scaledLoudness} fill="black" />
        )}
      </animated.g>
      {hat === Hats.Tangie ? (
        <image x={-10} y={-30} href="/tangie.png" width={20} />
      ) : hat === Hats.Ears ? (
        <image x={-20} y={-25} href="/ears.png" width={40} />
      ) : null}
    </g>
  );
}
