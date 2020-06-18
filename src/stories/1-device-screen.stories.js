//  vendor
import React, { useContext, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { Button } from "reactstrap";
import { v4 as uuidv4 } from "uuid";
import { pathOr } from "ramda";

// store
import { CounterContext } from "../store/context";

// utils
import { socket } from "../utils/device-control";

export const DeviceList = () => {
  const { state, dispatch } = useContext(CounterContext);
  const device = pathOr({}, ["devices", 0], state);
  const logs = pathOr([], ["logs"], state);

  const socketInvokation = () => {
    socket
      .emit("group.invite", device.channel, `tx.${uuidv4()}`, {
        requirements: {
          serial: {
            value: device.serial,
            match: "exact",
          },
        },
      })
      .on("logcat.entry", (rawData) => {
        dispatch({ type: "ADD_LOG", payload: rawData.message });
      });
  };

  useEffect(() => {
    if (device.channel) socketInvokation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  const getLogs = () => {
    socket.emit("logcat.start", device.channel, `tx.${uuidv4()}`, {
      filters: [],
    });
  };

  const stopLogs = () => {
    socket.emit("logcat.stop", device.channel, `tx.${uuidv4()}`, {
      filters: [],
    });
  };

  const clearLogs = () => dispatch({ type: "CLEAR_LOGS" });

  return (
    <div>
      Device: {device.marketName}
      <div>
        <Button color="primary" onClick={getLogs}>
          GET
        </Button>
        <Button color="danger" onClick={stopLogs}>
          STOP
        </Button>
        <Button color="danger" onClick={clearLogs}>
          CLEAR
        </Button>
      </div>
      {Array.isArray(logs) &&
        logs.map((message, i) => (
          <div key={i} style={{ display: "block" }}>
            {message}
          </div>
        ))}
    </div>
  );
};

storiesOf("Logs", module).add("First Devices", () => <DeviceList />);
