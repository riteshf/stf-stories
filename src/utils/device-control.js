import socketIOClient from "socket.io-client";
import url from "url";
import { v4 as uuidv4 } from "uuid";
import { doneListener } from "./listener";

// constants
const wsUrl = url.parse("http://localhost:7110", true);
wsUrl.query.uip = window.location.hostname;

const websocketUrl = url.format(wsUrl);

export const socket = socketIOClient(websocketUrl, {
  reconnection: false,
  transports: ["websocket"],
});

export const connectDevice = (device) => {
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

export const completeListener = () => {
  socket.on("tx.done", doneListener);
};
export const removeCompleteListener = () => {
  socket.removeListener("tx.done", doneListener);
};

export const getLogs = (device) => {
  socket.emit("logcat.start", device.channel, `tx.${uuidv4()}`, {
    filters: [],
  });
};

export const stopLogs = (device) => {
  socket.emit("logcat.stop", device.channel, `tx.${uuidv4()}`, {
    filters: [],
  });
};

export const navigate = (channel, url, browser) => {
  socket.emit("browser.open", channel, `tx.${uuidv4()}`, {
    url: url,
    browser: browser,
  });
};

export const screeshot = (channel, callback) => {
  socket
    .emit("screen.capture", channel, `tx.${uuidv4()}`, null)
    .on("tx.done", (X, data) => {
      doneListener(X);
      callback && data && callback(data);
    });
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
