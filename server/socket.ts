import { logger } from "./logger.ts";
import type {
  WebSocket,
  WebSocketEvent,
} from "https://deno.land/std@0.91.0/ws/mod.ts";

// It's a bit weird to reach into the client folder for this, but CRA doesn't
// like importing from outside of the client/src directory. Meanwhile, deno is
// fine with it, and we don't need them anymore after compilation.
import type {
  UpstreamMessage,
  DownstreamMessage,
} from "../client/src/common/index.ts";

/*
=================
Lazy global state
=================
*/

const roommates: {
  [roommateId: string]: {
    socket: WebSocket;
    heartbeatInterval: number;
    position: { x: number; y: number; mouseX: number; mouseY: number };
    alive: boolean;
  };
} = {};

let currentId = 0;

/*
================
Socket lifecycle
================
*/

function getNewId() {
  return `Roommate-#${currentId++}`;
}

function checkAlive(roommateId: string) {
  if (!roommates[roommateId].alive) {
    logger.info(`${roommateId} timed out`);
    cleanupRoommate(roommateId);
  }
  roommates[roommateId].alive = false;
}

function initializeRoommate(socket: WebSocket) {
  const id = getNewId();
  safeSend(socket, { type: "handshake", selfId: id });

  roommates[id] = {
    socket,
    heartbeatInterval: setInterval(() => checkAlive(id), 5000),
    position: { x: 0, y: 0, mouseX: 0, mouseY: 0 },
    alive: false,
  };

  return id;
}

async function cleanupRoommate(roommateId: string) {
  const roommate = roommates[roommateId];
  if (roommate !== undefined) {
    clearInterval(roommate.heartbeatInterval);

    try {
      await roommate.socket.close();
    } catch {
      // This will usually be due to double-closing
    }

    delete roommates[roommateId];
  }
}

/*
==============
Send Utilities
==============
*/
function broadcast(message: DownstreamMessage, exceptRoommateId: string) {
  Object.entries(roommates)
    .filter(([id]) => id !== exceptRoommateId)
    .forEach(([, { socket }]) => safeSend(socket, message));
}

function safeSend(ws: WebSocket, message: DownstreamMessage) {
  ws.send(JSON.stringify(message));
}

/*
========
Business
========
*/
function handleMessage(message: string, roommateId: string) {
  try {
    const parsed: UpstreamMessage = JSON.parse(message);
    if (parsed.type === "heartbeat") {
      roommates[roommateId].alive = true;
    } else {
      if (parsed.type === "position" || parsed.type === "join") {
        const { x, y, mouseX, mouseY } = parsed;
        roommates[roommateId].position = { x, y, mouseX, mouseY };
      }
      broadcast(parsed, roommateId);
    }
  } catch (e) {
    logger.error("Failed to ", e.error);
  }
}

export async function configureSocket(socket: WebSocket) {
  const id = initializeRoommate(socket);

  logger.info(`${id} connected`);
  logger.info(`Currently online: ${Object.keys(roommates)}`);

  // Send initial position reports to the one who just joined
  Object.entries(roommates)
    .filter(([roommateId]) => roommateId !== id)
    .forEach(([roommateId, { position }]) =>
      safeSend(socket, {
        type: "position",
        fromRoommateId: roommateId,
        ...position,
      })
    );

  // We're intentinoally awaiting here, blocking the request from closing
  for await (const event of socket) {
    if (typeof event === "string") {
      await handleMessage(event, id);
    }
  }

  await cleanupRoommate(id);
  broadcast({ type: "leave", fromRoommateId: id }, id);
  logger.info(`#${id} disconnected`);
}
