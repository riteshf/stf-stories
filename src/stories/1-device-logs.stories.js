//  vendor
import React, { useContext, useEffect, useState } from "react";
import { storiesOf } from "@storybook/react";
import { Button, FormGroup, Label, Input, Col } from "reactstrap";
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
  const {
    state: { devices, logs },
    dispatch,
  } = useContext(CounterContext);
  const [device, setDevice] = useState({});

  const selectDevice = (serial) => {
    const d = devices.filter((d) => d.serial === serial)[0] || {};
    connectDevice(d);
    if (d.present) {
      setDevice(d);
      enableAddLogs(dispatch);
    }
  };

  useEffect(() => {
    completeListener();
    return () => removeCompleteListener();
  }, []);

  const clearLogs = () => dispatch({ type: "CLEAR_LOGS" });

  return (
    <div>
      <FormGroup row>
        <Label for="exampleSelect" sm={2}>
          Select Device
        </Label>
        <Col sm={10}>
          <select
            value={device.serial}
            onChange={(e) => selectDevice(e.target.value)}
          >
            <option value="aaaaaa">Select a device</option>
            {devices.map((d, i) => (
              <option key={i} value={d.serial}>
                {d.marketName}
              </option>
            ))}
          </select>
        </Col>
      </FormGroup>
      {device.channel && (
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
      )}
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
