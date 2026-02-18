const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const VIEW_PASSWORD = process.env.VIEW_PASSWORD || "changeme";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

let broadcaster = null;
const viewers = new Set();

wss.on("connection", ws => {
  ws.on("message", message => {
    const data = JSON.parse(message);

    // AUTH VIEWER
    if (data.type === "auth") {
      if (data.password === VIEW_PASSWORD) {
        ws.auth = true;
        ws.send(JSON.stringify({ type: "auth-ok" }));
      } else {
        ws.send(JSON.stringify({ type: "auth-fail" }));
      }
      return;
    }

    // REGISTER ROLES
    if (data.type === "broadcaster") {
      broadcaster = ws;
      return;
    }

    if (data.type === "viewer") {
      if (!ws.auth) return;
      viewers.add(ws);
      return;
    }

    // SIGNALING
    if (data.type === "signal") {
      if (ws === broadcaster) {
        viewers.forEach(v => v.send(JSON.stringify(data)));
      } else {
        broadcaster?.send(JSON.stringify(data));
      }
    }
  });

  ws.on("close", () => {
    viewers.delete(ws);
    if (ws === broadcaster) broadcaster = null;
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
