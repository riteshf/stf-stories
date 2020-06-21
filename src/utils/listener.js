import { socket } from "./device-control";

export const doneListener = (someChannel, data) => {
  socket.emit("tx.cleanup", someChannel);
  return data;
};
