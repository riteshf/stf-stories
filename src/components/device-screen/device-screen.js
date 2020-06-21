//  vendor
import React, { useRef, useState, useEffect } from "react";

// css
import "./device-screen.css";

// utils
import {
  socket,
  emitDeviceConnect,
  gestureStart,
  touchMove,
  gestureStop,
} from "../../utils/device-control";
import {
  onScreenInterestAreaChanged,
  onScreenInterestGained,
  onScreenInterestLost,
} from "../../utils/socket-functions";
import {
  scalingService,
  vendorBackingStorePixelRatio,
  adjustedBoundSizeFn,
} from "./utils";

// constants
const URL = window.URL || window.webkitURL;
const devicePixelRatio = window.devicePixelRatio || 1;
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
          const backingStoreRatio = vendorBackingStorePixelRatio(g);
          const frontBackRatio = devicePixelRatio / backingStoreRatio;
          const { width, height } = canvas;
          canvas.width = width * frontBackRatio;
          canvas.height = height * frontBackRatio;
          g.scale(frontBackRatio, frontBackRatio);
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

  const onMouseDown = (e) => {
    e.preventDefault();

    const {
      offsetWidth,
      offsetHeight,
      offsetLeft,
      offsetTop,
    } = deviceScreenRef.current;

    const scaled = scaler.coords(
      offsetWidth,
      offsetHeight,
      e.pageX - offsetLeft,
      e.pageY - offsetTop,
      device.display.rotation
    );

    gestureStart(
      device.channel,
      {
        seq: nextSeq(seq + 1),
      },
      {
        seq: nextSeq(seq + 2),
        contact: 0,
        x: scaled.xP,
        y: scaled.yP,
        pressure: e.force || 0.5,
      },
      {
        seq: nextSeq(seq + 3),
      }
    );
    setIsGuestureStarted(true);
  };

  const onMouseMove = (e) => {
    e.preventDefault();
    if (isGuestureStarted) {
      const {
        offsetWidth,
        offsetHeight,
        offsetLeft,
        offsetTop,
      } = deviceScreenRef.current;

      const scaled = scaler.coords(
        offsetWidth,
        offsetHeight,
        e.pageX - offsetLeft,
        e.pageY - offsetTop,
        device.display.rotation
      );

      touchMove(
        device.channel,
        {
          seq: nextSeq(seq + 1),
          contact: 0,
          x: scaled.xP,
          y: scaled.yP,
          pressure: e.force || 0.5,
        },
        {
          seq: nextSeq(seq + 2),
        }
      );
    }
  };

  const onMouseUp = (e) => {
    e.preventDefault();
    gestureStop(device.channel, { seq: nextSeq(seq + 1) });
    setIsGuestureStarted(false);
  };

  useEffect(() => {
    if (isGuestureStarted) {
      canvasRef.current.onMouseMove = onMouseMove;
    } else {
      canvasRef.current.onMouseMove = () => {};
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuestureStarted]);

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
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <canvas className="screen" ref={canvasRef} width="821px" height="821px" />
    </div>
  );
};
