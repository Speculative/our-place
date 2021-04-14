import { observer } from "mobx-react-lite";
import { room } from "./store";

const spacing = 80;

export const Grid = observer(() => {
  const { width, height } = room;
  return (
    <g>
      {Array.from({ length: Math.ceil(width / spacing) + 1 }, (_, i) => i).map(
        (i) => (
          <line
            x1={i * spacing}
            y1={0}
            x2={i * spacing}
            y2={height}
            stroke="#303030"
            key={`col-${i}`}
          />
        )
      )}
      {Array.from({ length: Math.ceil(height / spacing) + 1 }, (_, i) => i).map(
        (i) => (
          <line
            x1={0}
            y1={i * spacing}
            x2={width}
            y2={i * spacing}
            stroke="#303030"
            key={`col-${i}`}
          />
        )
      )}
    </g>
  );
});
