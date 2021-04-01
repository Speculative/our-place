import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { Logger } from "https://deno.land/x/optic/mod.ts";

const app = new Application();
const router = new Router();
const logger = new Logger();

router.get("/static/:path", async (ctx) => {
    logger.info(ctx.request.url.pathname);
    await send(ctx, ctx.request.url.pathname, {
        root: `${Deno.cwd()}`
    });
});

router.get("/api", async (ctx) => {
  ctx.response.body = "Hi"
})

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", ({ hostname, port, secure }) => {
  logger.info(
    `Listening on: ${secure ? "https://" : "http://"}${hostname ??
      "localhost"}:${port}`,
  );
});

app.addEventListener("error", (error) => {
    logger.error(error.error);
});

await app.listen({ port: 8000 });