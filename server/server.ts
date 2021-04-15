import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { logger } from "./logger.ts";
import { configureSocket } from "./socket.ts";

const app = new Application();
const router = new Router();

// Socket
router.get("/socket", async (ctx) => {
  logger.info("[Routing] Socket");
  const socket = await ctx.upgrade();
  await configureSocket(socket);
});

app.use(router.routes());
app.use(router.allowedMethods());

// Static file serving goes at the bottom to make it lowest-priority
app.use(async (ctx) => {
  logger.info("[Routing] Static asset", ctx.request.url.pathname);
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  });
});

app.use(async (ctx, next) => {
  logger.info("[Routing]", ctx.request.url.pathname);
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
