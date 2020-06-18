//  vendor
import React, { useRef, useState, useEffect } from "react";

// socket
import { socket, emitDeviceConnect } from "../../socket";

// utils
import { adjustedBoundSizeFn } from "./util";
import {
  onScreenInterestAreaChanged,
  onScreenInterestGained,
  onScreenInterestLost,
} from "./socket-functions";

// css
import "./device-screen.css";

// constants
const URL = window.URL || window.webkitURL;

export const DeviceScreen = ({ device }) => {
  const canvasRef = useRef();
  const positionerRef = useRef();
  const deviceScreenRef = useRef();

  const [adjustedBoundSize, setAdjustedBoundSize] = useState({
    w: 0,
    h: 0,
  });
  const [cachedEnabled, setCachedEnabled] = useState(false);

  const updateBounds = (ws) => {
    // FIXME: element is an object HTMLUnknownElement in IE9
    const w = deviceScreenRef.current.offsetWidth;
    const h = deviceScreenRef.current.offsetHeight;

    // Developer error, let's try to reduce debug time
    if (!w || !h) {
      throw new Error("Unable to read bounds; container must have dimensions");
    }

    const newAdjustedBoundSize = adjustedBoundSizeFn(h, w, device);

    if (
      !adjustedBoundSize ||
      newAdjustedBoundSize.w !== adjustedBoundSize.w ||
      newAdjustedBoundSize.h !== adjustedBoundSize.h
    ) {
      setAdjustedBoundSize(newAdjustedBoundSize);
      onScreenInterestAreaChanged(ws, newAdjustedBoundSize);
      return newAdjustedBoundSize;
    }
  };

  const onmessage = (message, ws) => {
    if (message.data instanceof Blob) {
      if (device.using && ws.readyState === WebSocket.OPEN) {
        const blob = new Blob([message.data], {
          type: "image/jpeg",
        });
        const img = new Image();

        img.onload = function () {
          const canvas = canvasRef.current;
          const g = canvas.getContext("2d");
          g.clearRect(0, 0, canvas.width, canvas.height);
          g.drawImage(img, 0, 0, img.width, img.height);
        };
        img.src = URL.createObjectURL(blob);
      }
    }
  };

  const onopen = (ws) => {
    const newEnabled = device.using && ws.readyState === WebSocket.OPEN;

    if (newEnabled === cachedEnabled) {
      updateBounds(ws);
    } else if (newEnabled) {
      const newAdjustedBoundSize = updateBounds(ws);
      onScreenInterestGained(ws, newAdjustedBoundSize);
    } else {
      const canvas = canvasRef.current;
      const g = canvas.getContext("2d");
      g.clearRect(0, 0, canvas.width, canvas.height);
      onScreenInterestLost(ws);
    }

    setCachedEnabled(newEnabled);
  };

  useEffect(() => {
    emitDeviceConnect(device);
    const ws = new WebSocket(device.display.url);
    ws.onmessage = (m) => onmessage(m, ws);
    ws.onopen = () => onopen(ws);

    socket.on("tx.done", (completedTaskId) => {
      socket.emit("tx.cleanup", completedTaskId);
    });

    return () => onScreenInterestLost(ws);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fill-height">
      <div className="device-screen" ref={deviceScreenRef} id={device.serial}>
        <div className="positioner" ref={positionerRef}>
          <canvas
            className="screen"
            ref={canvasRef}
            width="821px"
            height="821px"
          />
        </div>
      </div>
    </div>
  );
};
