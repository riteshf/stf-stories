//  vendor
import React, { useContext, useEffect, useState } from "react";
import { storiesOf } from "@storybook/react";
import { Button, FormGroup, Label, Col } from "reactstrap";

// store
import { CounterContext } from "../store/context";

// utils
import { connectDevice, screenshot } from "../utils/device-control";
import { serverUrl } from "../environment.json";

export const DeviceScreenShot = () => {
  const {
    state: { devices },
  } = useContext(CounterContext);
  const [device, setDevice] = useState({});
  const [href, setHref] = useState("");

  const selectDevice = (serial) => {
    const d = devices.filter((d) => d.serial === serial)[0];
    if (d && d.present) {
      setDevice(d);
    } else {
      setDevice({});
    }
  };

  useEffect(() => {
    if (device.present) {
      connectDevice(device);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  const capture = () =>
    screenshot(device.channel, (response) => {
      const json = JSON.parse(response.body);
      setHref(json.href);
    });

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
        <>
          <div style={{ paddingBottom: "20px" }}>
            <Button color="primary" onClick={capture}>
              GET
            </Button>
          </div>
          {href && (
            <img
              src={`${serverUrl}${href}`}
              alt=""
              width="220px"
              height="389px"
            />
          )}
        </>
      )}
    </div>
  );
};

storiesOf("Screenshot", module).add("First Devices", () => (
  <DeviceScreenShot />
));
