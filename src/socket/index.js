import socketIOClient from "socket.io-client";
import url from "url";

// constants
const wsUrl = url.parse("http://localhost:7110", true);
wsUrl.query.uip = window.location.hostname;

const websocketUrl = url.format(wsUrl);

export const socket = socketIOClient(websocketUrl, {
  reconnection: false,
  transports: ["websocket"],
});
