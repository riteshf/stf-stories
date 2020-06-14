//  vendor
import React, { useContext, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { Button } from "reactstrap";
import { v4 as uuidv4 } from "uuid";
import { pathOr } from "ramda";

// store
import { CounterContext } from "../store/context";

// socket
import { socket } from "../socket";

export const DeviceList = () => {
  const { state, dispatch } = useContext(CounterContext);
  const device = pathOr({}, ["devices", 0], state);
  const logs = pathOr([], ["logs"], state);

  const socketInvokation = () => {
    socket
      .emit(
        "group.invite",
        device.channel,
        "tx.2265bd83-e987-4cd4-99a0-ee7b567d8fba",
        {
          requirements: {
            serial: {
              value: device.serial,
              match: "exact",
            },
          },
        }
      )
      .on("logcat.entry", (rawData) => {
        dispatch({ type: "ADD_LOG", payload: rawData.message });
      });
  };
  useEffect(() => {
    if (device.channel) socketInvokation();
  }, [device]);

  const getLogs = () => {
    const response = socket.emit(
      "logcat.start",
      device.channel,
      `tx.${uuidv4()}`,
      {
        filters: [],
      }
    );
  };

  const stopLogs = () => {
    const response = socket.emit(
      "logcat.stop",
      device.channel,
      `tx.${uuidv4()}`,
      {
        filters: [],
      }
    );
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
