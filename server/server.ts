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

const sockets: WebSocket[] = [];

router.get("/socket", async (ctx) => {
  logger.info("Socket opened");
  const socket = await ctx.upgrade();
  sockets.push(socket);
  socket.send("Hi");
  for await (const event of socket) {
    if (typeof event === "string") {
      // const parsed = JSON.parse(event);
      // logger.info(parsed);
      logger.info(event);
      sockets.forEach((socket) => socket.send(event));
    }
  }
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
