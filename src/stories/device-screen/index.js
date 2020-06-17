//  vendor
import React, { useRef, useState, useEffect } from "react";
import { Button } from "reactstrap";
import { v4 as uuidv4 } from "uuid";

// socket
import { socket } from "../../socket";

// utils
import {
  VendorUtil,
  ImagePool,
  rotator,
  isRotated,
  vendorBackingStorePixelRatio,
  adjustedBoundSizeFn,
} from "./util";

// css
import "./device-screen.css";

// constants
var URL = window.URL || window.webkitURL;
const BLANK_IMG =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
const cssTransform = VendorUtil(["transform", "webkitTransform"]);

const options = {
  autoScaleForRetina: true,
  density: Math.max(1, Math.min(1.5, devicePixelRatio || 1)),
  minscale: 0.36,
};

const parentAspect = 1;

export const DeviceScreen = ({ device }) => {
  const canvasRef = useRef(null);
  const positionerRef = useRef(null);

  const [canvasAspect, setCanvasAspect] = useState(1);
  const [adjustedBoundSize, setAdjustedBoundSize] = useState({
    w: 0,
    h: 0,
  });
  const [cachedEnabled, setCachedEnabled] = useState(false);
  const [imgProps, setImgProps] = useState({
    cachedImageWidth: 0,
    cachedImageHeight: 0,
    cssRotation: 0,
    alwaysUpright: false,
    imagePool: new ImagePool(10),
  });
  const [screen, setScreen] = useState({
    rotation: 0,
    bounds: {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    },
  });
  const [cachedScreen, setCachedScreen] = useState({
    rotation: 0,
    bounds: {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    },
  });

  const onScreenInterestAreaChanged = (ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send("size " + adjustedBoundSize.w + "x" + adjustedBoundSize.h);
    }
  };

  const onScreenInterestGained = (ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send("size " + adjustedBoundSize.w + "x" + adjustedBoundSize.h);
      ws.send("on");
    }
  };

  const onScreenInterestLost = (ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send("off");
    }
  };

  function applyQuirks(banner) {
    document
      .getElementById(device.serial)
      .classList.toggle(
        "quirk-always-upright",
        (imgProps.alwaysUpright = banner.quirks.alwaysUpright)
      );
  }

  function hasImageAreaChanged(img) {
    return (
      cachedScreen.bounds.w !== screen.bounds.w ||
      cachedScreen.bounds.h !== screen.bounds.h ||
      imgProps.cachedImageWidth !== img.width ||
      imgProps.cachedImageHeight !== img.height ||
      cachedScreen.rotation !== screen.rotation
    );
  }

  function updateImageArea(img) {
    if (!hasImageAreaChanged(img)) {
      return;
    }

    const { cachedImageHeight, cachedImageWidth, cssRotation } = imgProps;
    const canvas = canvasRef.current;
    const g = canvas.getContext("2d");
    const positioner = positionerRef.current;

    setImgProps({
      ...imgProps,
      cachedImageWidth: img.width,
      cachedImageHeight: img.height,
      cssRotation:
        cssRotation + rotator(cachedScreen.rotation, screen.rotation),
    });
    setCachedScreen({
      ...cachedScreen,
      rotation: screen.rotation,
      bounds: {
        ...cachedScreen.bounds,
        h: screen.bounds.h,
        w: screen.bounds.w,
      },
    });

    if (options.autoScaleForRetina) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const backingStoreRatio = vendorBackingStorePixelRatio(g);
      const frontBackRatio = devicePixelRatio / backingStoreRatio;
      canvas.width = cachedImageWidth * frontBackRatio;
      canvas.height = cachedImageHeight * frontBackRatio;
      g.scale(frontBackRatio, frontBackRatio);
    } else {
      canvas.width = cachedImageWidth;
      canvas.height = cachedImageHeight;
    }

    canvas.style[cssTransform] = "rotate(" + cssRotation + "deg)";
    setCanvasAspect(canvas.width / canvas.height);

    if (isRotated(screen) && !imgProps.alwaysUpright) {
      setCanvasAspect(img.height / img.width);
      document.getElementById(device.serial).classList.add("rotated");
    } else {
      setCanvasAspect(img.width / img.height);
      document.getElementById(device.serial).classList.remove("rotated");
    }

    if (imgProps.alwaysUpright) {
      // If the screen image is always in upright position (but we
      // still want the rotation animation), we need to cancel out
      // the rotation by using another rotation.
      positioner.style[cssTransform] = "rotate(" + -cssRotation + "deg)";
    }

    maybeFlipLetterbox();
  }

  function maybeFlipLetterbox() {
    document
      .getElementById(device.serial)
      .classList.toggle("letterboxed", parentAspect < canvasAspect);
  }

  function updateBounds(ws) {
    // FIXME: element is an object HTMLUnknownElement in IE9
    const w = (screen.bounds.w = document.getElementById(
      device.serial
    ).offsetWidth);
    const h = (screen.bounds.h = document.getElementById(
      device.serial
    ).offsetHeight);

    // Developer error, let's try to reduce debug time
    if (!w || !h) {
      throw new Error("Unable to read bounds; container must have dimensions");
    }

    const newAdjustedBoundSize = adjustedBoundSizeFn(h, w, device, screen);

    if (
      !adjustedBoundSize ||
      newAdjustedBoundSize.w !== adjustedBoundSize.w ||
      newAdjustedBoundSize.h !== adjustedBoundSize.h
    ) {
      setAdjustedBoundSize(newAdjustedBoundSize);
      onScreenInterestAreaChanged(ws);
    }
  }

  const onmessage = (message, ws) => {
    const { imagePool } = imgProps;

    setScreen({
      ...screen,
      rotation: device.display.rotation,
    });

    if (message.data instanceof Blob) {
      if (device.using && ws.readyState === WebSocket.OPEN) {
        var blob = new Blob([message.data], {
          type: "image/jpeg",
        });

        var img = imagePool.next();

        img.onload = function () {
          updateImageArea(this);

          const canvas = canvasRef.current;
          const g = canvas.getContext("2d");

          g.drawImage(img, 0, 0, img.width, img.height);

          // Try to forcefully clean everything to get rid of memory
          // leaks. Note that despite this effort, Chrome will still
          // leak huge amounts of memory when the developer tools are
          // open, probably to save the resources for inspection. When
          // the developer tools are closed no memory is leaked.
          img.onload = img.onerror = null;
          img.src = BLANK_IMG;
          img = null;
          blob = null;

          URL.revokeObjectURL(url);
          url = null;
        };

        img.onerror = function () {
          // Happily ignore. I suppose this shouldn't happen, but
          // sometimes it does, presumably when we're loading images
          // too quickly.

          // Do the same cleanup here as in onload.
          img.onload = img.onerror = null;
          img.src = BLANK_IMG;
          img = null;
          blob = null;

          URL.revokeObjectURL(url);
          url = null;
        };

        var url = URL.createObjectURL(blob);
        img.src = url;
      }
    } else if (/^start /.test(message.data)) {
      applyQuirks(JSON.parse(message.data.substr("start ".length)));
    }
  };

  const onopen = (ws) => {
    var newEnabled = device.using && ws.readyState === WebSocket.OPEN;

    if (newEnabled === cachedEnabled) {
      updateBounds(ws);
    } else if (newEnabled) {
      updateBounds(ws);
      onScreenInterestGained(ws);
    } else {
      const canvas = canvasRef.current;
      const g = canvas.getContext("2d");
      g.clearRect(0, 0, canvas.width, canvas.height);
      onScreenInterestLost(ws);
    }

    setCachedEnabled(newEnabled);
  };

  const socketInvokation = () => {
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

    connected && screenShare();
  };

  const screenShare = () => {
    const ws = new WebSocket(device.display.url);
    ws.onmessage = (m) => onmessage(m, ws);
    ws.onopen = () => onopen(ws);
  };
  useEffect(() => {
    socketInvokation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div>
        <Button color="primary">Portrait</Button>
        <Button color="primary">Landscape</Button>
        <Button color="danger">HIDE Screen</Button>
      </div>
      <div className="device-screen" id={device.serial}>
        <div className="positioner" ref={positionerRef}>
          <canvas
            className="screen"
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
          />
          <canvas
            className="hacky-stretcher"
            ref={canvasRef}
            width={1}
            height={1}
          />
        </div>
      </div>
    </div>
  );
};
