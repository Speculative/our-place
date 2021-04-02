import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

const socket = new WebSocket("ws://localhost:3000/socket");
socket.addEventListener("open", () => {
  console.log("Opened socket");
  requestAnimationFrame(onEachFrame);
});

socket.addEventListener("message", (message) => {
  console.log("Message:", message.data);
});

function onEachFrame() {
  socket.send("Client says hello");
  requestAnimationFrame(onEachFrame);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
