//  vendor
import React, { useRef, useState, useEffect } from "react";
import { useGesture } from "react-use-gesture";

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
import { pathOr } from "ramda";

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
  const [seq, setSeq] = useState(-1);
  const display = pathOr({ width: 0, height: 0 }, ["display"], device);

  const scaler = scalingService.coordinator(display.width, display.height);

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
          canvas.width = img.width;
          canvas.height = img.height;
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

  const onDragStart = (e) => {
    const {
      offsetWidth,
      offsetHeight,
      offsetLeft,
      offsetTop,
    } = deviceScreenRef.current;

    const scaled = scaler.coords(
      offsetWidth,
      offsetHeight,
      e.event.pageX - offsetLeft,
      e.event.pageY - offsetTop,
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
  };

  const onDrag = (e) => {
    const {
      offsetWidth,
      offsetHeight,
      offsetLeft,
      offsetTop,
    } = deviceScreenRef.current;

    const scaled = scaler.coords(
      offsetWidth,
      offsetHeight,
      e.event.pageX - offsetLeft,
      e.event.pageY - offsetTop,
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
  };

  const onDragEnd = (e) => {
    gestureStop(device.channel, { seq: nextSeq(seq + 1) });
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

  const bind = useGesture(
    {
      onDrag: onDrag,
      onDragStart: onDragStart,
      onDragEnd: onDragEnd,
    },
    {}
  );
  return (
    <div
      className="device-screen"
      ref={deviceScreenRef}
      id={device.serial}
      {...bind()}
    >
      <canvas className="screen" ref={canvasRef} width="821px" height="821px" />
    </div>
  );
};
