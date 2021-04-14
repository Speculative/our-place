import { selfPosition } from "./store";

const SPEED = 0.4;

enum Direction {
  North,
  South,
  East,
  West,
}

const MOVES = {
  [Direction.North]: [0, -1],
  [Direction.South]: [0, 1],
  [Direction.East]: [1, 0],
  [Direction.West]: [-1, 0],
};

const HOTKEYS = {
  w: Direction.North,
  s: Direction.South,
  d: Direction.East,
  a: Direction.West,
};

let lastMoveTimestamp: number | undefined = undefined;
let moving: Direction[] = [];

function startMove(direction: Direction) {
  if (moving.length === 0) {
    requestAnimationFrame(moveTick);
  }

  if (moving.find((d) => d === direction) === undefined) {
    moving.push(direction);
  }
}

function endMove(direction: Direction) {
  const index = moving.findIndex((m) => m === direction);
  if (index !== -1) {
    moving.splice(index, 1);
  }
}

function moveTick(ts: number) {
  if (lastMoveTimestamp === undefined) {
    lastMoveTimestamp = ts;
    requestAnimationFrame(moveTick);
  } else {
    if (moving.length === 0) {
      lastMoveTimestamp = undefined;
      return;
    }

    const { x, y } = selfPosition;
    const [px, py] = moving
      .map((direction) => MOVES[direction])
      .reduce(([sx, sy], [px, py]) => [sx + px, sy + py], [0, 0]);

    const dt = ts - lastMoveTimestamp;
    const scale = Math.max(Math.sqrt(px * px + py * py), 1);
    const dx = (px * dt * SPEED) / scale;
    const dy = (py * dt * SPEED) / scale;

    selfPosition.move(x + dx, y + dy);
    lastMoveTimestamp = ts;
    requestAnimationFrame(moveTick);
  }
}

export function registerHotkeys() {
  document.addEventListener("keydown", (e) => {
    const match = Object.entries(HOTKEYS).find(
      ([hotkey, _]) => hotkey === e.key
    );
    if (match !== undefined) {
      const [, direction] = match;
      startMove(direction);
    }
  });
  document.addEventListener("keyup", (e) => {
    const match = Object.entries(HOTKEYS).find(
      ([hotkey, _]) => hotkey === e.key
    );
    if (match !== undefined) {
      const [, direction] = match;
      endMove(direction);
    }
  });
}
