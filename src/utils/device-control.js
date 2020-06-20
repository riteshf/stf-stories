import socketIOClient from "socket.io-client";
import url from "url";
import { v4 as uuidv4 } from "uuid";

// constants
const wsUrl = url.parse("http://localhost:7110", true);
wsUrl.query.uip = window.location.hostname;

const websocketUrl = url.format(wsUrl);

export const socket = socketIOClient(websocketUrl, {
  reconnection: false,
  transports: ["websocket"],
});

export const emitDeviceConnect = (device) => {
  const { connected } = socket
    .emit("group.invite", device.channel, `tx.${uuidv4()}`, {
      requirements: {
        serial: { value: device.serial, match: "exact" },
      },
    })
    .emit("user.settings.update", {
      lastUsedDevice: device.serial,
    })
    .emit("connect.start", device.channel, `tx.${uuidv4()}`, null);

  return connected;
};

export const gestureStart = () => {
  console.log("gestureStart");
};

export const touchDown = () => {
  console.log("touchDown");
};
export const gestureStop = () => {
  console.log("gestureStop");
};
