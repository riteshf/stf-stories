//  vendor
import React, { useContext, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { Button } from "reactstrap";
import { pathOr } from "ramda";

// store
import { CounterContext } from "../store/context";
import { enableAddLogs } from "../store/actions";

// utils
import {
  connectDevice,
  getLogs,
  stopLogs,
  completeListener,
  removeCompleteListener,
} from "../utils/device-control";

export const DeviceLogs = () => {
  const { state, dispatch } = useContext(CounterContext);
  const device = pathOr({}, ["devices", 0], state);
  const logs = pathOr([], ["logs"], state);

  useEffect(() => {
    if (device.present) {
      connectDevice(device);
      enableAddLogs(dispatch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  useEffect(() => {
    completeListener();
    return () => removeCompleteListener();
  }, []);

  const clearLogs = () => dispatch({ type: "CLEAR_LOGS" });

  return (
    <div>
      Device: {device.marketName}
      <div>
        <Button color="primary" onClick={() => getLogs(device)}>
          GET
        </Button>
        <Button color="danger" onClick={() => stopLogs(device)}>
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

storiesOf("Logs", module).add("First Devices", () => <DeviceLogs />);