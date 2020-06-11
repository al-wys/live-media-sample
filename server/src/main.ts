import * as express from "express";
import * as http from "http";
import * as socket from "socket.io";

const port = process.env.PORT || 1234;
const app = express();
const server = http.createServer(app).listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
const presenterIo = socket(server, { path: "/presenter" });
const viewerIo = socket(server, { path: "/viewer" });

const presenterSocketMap: { [x: string]: socket.Socket } = {};
const viewerSockerMap: { [x: string]: socket.Socket } = {};
const DEMO_CUSTOMER_ID = "Megan";
const DEMO_AGENT_ID = "Frank";

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', process.env.WEB_SITE_HOST || "http://localhost:3000");

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', "true");

  // Pass to next layer of middleware
  next();
});

app.get("/", (_, res: any) => {
  res.send("Hello World");
});

presenterIo.on("connection", (socket) => {
  const presenterId = socket.handshake.query.id;
  console.log(`Presenter - ${presenterId} is connected.`);
  presenterSocketMap[presenterId] = socket;

  socket.on("share", (data) => {
    viewerSockerMap[DEMO_AGENT_ID].emit("view", data); // Send video/audio data to specified agent
  });

  socket.on("disconnect", () => {
    viewerSockerMap[DEMO_AGENT_ID].disconnect(true); // Let the agent know that client is offline
  });
});

viewerIo.on("connection", (socket) => {
  const viewerId = socket.handshake.query.id;
  console.log(`Viewer - ${viewerId} is connected.`);
  viewerSockerMap[viewerId] = socket;

  socket.emit("ready", `${DEMO_CUSTOMER_ID} is here.`);
  presenterSocketMap[DEMO_CUSTOMER_ID].emit("ready", `Agent ${viewerId} is ready to help you.`); // Let the client know that an agent is ready
});