//  vendor
import React, { useRef, useState, useEffect } from "react";

// css
import "./device-screen.css";

// utils
import {
  socket,
  emitDeviceConnect,
  gestureStart,
  touchDown,
  gestureStop,
} from "../../utils/device-control";
import { adjustedBoundSizeFn } from "../../utils/screen-bounds";
import {
  onScreenInterestAreaChanged,
  onScreenInterestGained,
  onScreenInterestLost,
} from "../../utils/socket-functions";
import { scalingService } from "../../utils/scaling";

// constants
const URL = window.URL || window.webkitURL;
export const DeviceScreen = ({ device }) => {
  const canvasRef = useRef();
  const deviceScreenRef = useRef();

  const [adjustedBoundSize, setAdjustedBoundSize] = useState({
    w: 0,
    h: 0,
  });

  const [cachedEnabled, setCachedEnabled] = useState(false);
  const [isGuestureStarted, setIsGuestureStarted] = useState(false);
  const [seq, setSeq] = useState(-1);
  const [screen, setScreen] = useState({
    rotation: 0,
    bounds: {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    },
  });

  const scaler = scalingService.coordinator(
    device.display.width,
    device.display.height
  );

  function nextSeq(nextValue) {
    if (nextValue > 100) {
      setSeq(0);
    } else {
      setSeq(nextValue);
    }
    return nextValue;
  }

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

  const onTouchStart = (e) => {
    e.preventDefault();
    gestureStart(nextSeq(seq + 1));
    setIsGuestureStarted(true);
  };

  const onTouchMove = (e) => {
    e.preventDefault();
    if (isGuestureStarted) {
      const img = canvasRef.current;
      setScreen({
        ...screen,
        bounds: {
          w: img.offsetWidth,
          h: img.offsetHeight,
          x: img.offsetLeft,
          y: img.offsetTop,
        },
      });

      var x = e.pageX - screen.bounds.x;
      var y = e.pageY - screen.bounds.y;
      var scaled = scaler.coords(
        screen.bounds.w,
        screen.bounds.h,
        x,
        y,
        device.display.rotation
      );
      const pressure = e.force || 0.5;
      touchDown(nextSeq(seq + 1), 0, scaled.xP, scaled.yP, pressure);
    }
  };

  const onTouchEnd = (e) => {
    e.preventDefault();
    gestureStop(nextSeq(seq + 1));
    setIsGuestureStarted(false);
    nextSeq(0);
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
    <div
      className="device-screen"
      ref={deviceScreenRef}
      id={device.serial}
      onDragStart={onTouchStart}
      onDrag={onTouchMove}
      onDragEnd={onTouchEnd}
    >
      <canvas className="screen" ref={canvasRef} width="821px" height="821px" />
    </div>
  );
};
