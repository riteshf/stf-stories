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

export const gestureStart = (
  channel,
  guestureBody,
  touchDownBody,
  commitBody
) => {
  socket
    .emit("input.gestureStart", channel, guestureBody)
    .emit("input.touchDown", channel, touchDownBody)
    .emit("input.touchCommit", channel, commitBody);
};

export const touchMove = (channel, touchMoveBody, commitBody) => {
  socket
    .emit("input.touchMove", channel, touchMoveBody)
    .emit("input.touchCommit", channel, commitBody);
};

export const gestureStop = (channel, guestureBody) => {
  socket.emit("input.gestureStop", channel, guestureBody);
};
