import socketIOClient from "socket.io-client";
import url from "url";
import { v4 as uuidv4 } from "uuid";
import { doneListener } from "./listener";

// constants
import { socketUrl } from "../environment.json";

const wsUrl = url.parse(socketUrl, true);
wsUrl.query.uip = window.location.hostname;

const websocketUrl = url.format(wsUrl);

export const socket = socketIOClient(websocketUrl, {
  reconnection: false,
  transports: ["websocket"],
});

export const connectDevice = (device) => {
  socket
    .emit("group.invite", device.channel, `tx.${uuidv4()}`, {
      requirements: {
        serial: { value: device.serial, match: "exact" },
      },
    })
    .emit("user.settings.update", {
      lastUsedDevice: device.serial,
    })
    .emit("connect.start", device.channel, `tx.${uuidv4()}`, null);
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

export const screenshot = (channel, callback) => {
  socket
    .emit("screen.capture", channel, `tx.${uuidv4()}`, null)
    .on("tx.done", (X, data) => {
      doneListener(X);
      callback && data && callback(data);
    });
};
