import { socket } from "./device-control";

export const doneListener = (completedTaskId) => {
  socket.emit("tx.cleanup", completedTaskId);
};
