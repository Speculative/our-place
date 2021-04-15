const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(
  createProxyMiddleware("/socket", {
    target: "ws://localhost:8000/",
    changeOrigin: true,
    ws: true,
    logLevel: "debug",
  })
);
app.use(
  createProxyMiddleware("/sockjs-node", {
    target: "ws://localhost:3000/",
    changeOrigin: true,
    ws: true,
  })
);
app.use(
  createProxyMiddleware("/", {
    target: "http://localhost:3000",
    changeOrigin: true,
  })
);
app.listen(5000, () => console.log("Listening on localhost:5000"));
