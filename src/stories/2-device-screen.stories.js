//  vendor
import React, { useContext, useState } from "react";
import { storiesOf } from "@storybook/react";
import { Button } from "reactstrap";
import CanvasDraw from "react-canvas-draw";
import { pathOr } from "ramda";

// store
import { CounterContext } from "../store/context";

// socket
import { socket } from "../socket";

// utils
import { VendorUtil } from "./device-screen/util";

// constants
const BLANK_IMG =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

var cssTransform = VendorUtil(["transform", "webkitTransform"]);

export const DeviceList = ({ device, dispatch }) => {
  const [imgSrc, setImgSrc] = useState();
  const ws = new WebSocket(device.display.url);
  ws.binaryType = "blob";

  ws.onerror = function errorListener() {
    // @todo Handle
  };

  ws.onclose = function closeListener() {
    // @todo Maybe handle
  };

  ws.onopen = function openListener() {
    // checkEnabled();
  };

  const getLogs = () => {};

  const stopLogs = () => {};

  const clearLogs = () => dispatch({ type: "CLEAR_LOGS" });
  return (
    <div>
      Device: {device.marketName}
      <div>
        <Button color="primary" onClick={getLogs}>
          Portrait
        </Button>
        <Button color="primary" onClick={stopLogs}>
          Landscape
        </Button>
        <Button color="danger" onClick={clearLogs}>
          HIDE Screen
        </Button>
      </div>
      <CanvasDraw imgSrc={imgSrc} />
    </div>
  );
};

storiesOf("Screen", module).add("First Devices", () => {
  const { state, dispatch } = useContext(CounterContext);
  const device = pathOr(false, ["devices", 0], state);

  return device ? <DeviceList device={device} dispatch={dispatch} /> : <></>;
});
