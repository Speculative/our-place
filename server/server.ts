import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { Logger } from "https://deno.land/x/optic/mod.ts";
import {
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std@0.91.0/ws/mod.ts";

const app = new Application();
const router = new Router();
const logger = new Logger();

router.get("/static/:path", async (ctx) => {
  logger.info(ctx.request.url.pathname);
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}`,
  });
});

interface PositionReport {
  type: "position";
  x: number;
  y: number;
  mouseX: number;
  mouseY: number;
}

interface HandshakeReport {
  type: "handshake";
  selfId: string;
}

interface JoinReport {
  type: "join";
  x: number;
  y: number;
  mouseX: number;
  mouseY: number;
}

interface LeaveReport {
  type: "leave";
}

interface RTCOfferReport {
  type: "rtcOffer";
  toRoommateId: string;
  offer: any;
}

type ReportContract =
  | HandshakeReport
  | JoinReport
  | PositionReport
  | LeaveReport
  | RTCOfferReport;

type RoomReport = { fromRoommateId: string } & ReportContract;

const sockets: { [id: string]: WebSocket } = {};
const positions: {
  [id: string]: { x: number; y: number; mouseX: number; mouseY: number };
} = {};
let currentId = 0;

router.get("/socket", async (ctx) => {
  const socket = await ctx.upgrade();
  const id = `Roommate-${currentId++}`;
  logger.info(`#${id} connected`);
  sockets[id] = socket;
  positions[id] = { x: 0, y: 0, mouseX: 0, mouseY: 0 };

  socket.send(JSON.stringify({ type: "handshake", selfId: id }));
  // Send initial position reports
  Object.entries(positions)
    .filter(([roommateId]) => roommateId !== id)
    .forEach(([roommateId, { x, y, mouseX, mouseY }]) =>
      socket.send(
        JSON.stringify({ type: "position", roommateId, x, y, mouseX, mouseY })
      )
    );

  for await (const event of socket) {
    if (typeof event === "string") {
      const parsed: RoomReport = JSON.parse(event);
      const { type, fromRoommateId } = parsed;
      if (type === "position" || type === "join") {
        const { x, y, mouseX, mouseY } = parsed as PositionReport | JoinReport;
        positions[fromRoommateId] = { x, y, mouseX, mouseY };
      }

      // Re-broadcast to everone else in the room
      Object.entries(sockets)
        .filter(([socketId]) => socketId !== id)
        .forEach(([, s]) => s.send(event));
    }
  }

  logger.info(`#${id} disconnected`);
  delete sockets[id];
  delete positions[id];
  Object.values(sockets).forEach((s) =>
    s.send(JSON.stringify({ type: "leave", fromRoommateId: id }))
  );
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx, next) => {
  logger.info("Request", ctx.request.url.pathname);
  await next();
});

app.addEventListener("listen", ({ hostname, port, secure }) => {
  logger.info(
    `Listening on: ${secure ? "https://" : "http://"}${
      hostname ?? "localhost"
    }:${port}`
  );
});

app.addEventListener("error", (error) => {
  logger.error(error.error);
});

await app.listen({ port: 8000 });
