export const onScreenInterestAreaChanged = (ws, newAdjustedBoundSize) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send("size " + newAdjustedBoundSize.w + "x" + newAdjustedBoundSize.h);
  }
};

export const onScreenInterestGained = (ws, newAdjustedBoundSize) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send("size " + newAdjustedBoundSize.w + "x" + newAdjustedBoundSize.h);
    ws.send("on");
  }
};

export const onScreenInterestLost = (ws) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send("off");
  }
};
