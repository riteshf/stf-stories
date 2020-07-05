//  vendor
import React, { useContext, useEffect, useState } from "react";
import { storiesOf } from "@storybook/react";
import { ScreenShare } from "stf-screenshare";

// store
import { CounterContext } from "../store/context";

// components
import {
  completeListener,
  removeCompleteListener,
  socket,
} from "../utils/device-control";
import { FormGroup, Label, Col } from "reactstrap";

export const DeviceScreenStory = () => {
  const {
    state: { devices },
  } = useContext(CounterContext);
  const [device, setDevice] = useState({});

  const selectDevice = (serial) => {
    const d = devices.filter((d) => d.serial === serial)[0];
    if (d && d.present) {
      setDevice(d);
    } else {
      setDevice({});
    }
  };

  useEffect(() => {
    completeListener();
    return () => removeCompleteListener();
  }, []);

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
            <option></option>
            {devices.map((d, i) => (
              <option key={i} value={d.serial}>
                {d.marketName}
              </option>
            ))}
          </select>
        </Col>
      </FormGroup>
      {device.present && (
        <div>
          <ScreenShare device={device} appSocket={socket} />
        </div>
      )}
    </div>
  );
};

storiesOf("Screen", module).add("First Devices", () => <DeviceScreenStory />);
