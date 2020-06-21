//  vendor
import React, { useContext, useEffect, useState } from "react";
import { storiesOf } from "@storybook/react";
import { Button } from "reactstrap";
import { pathOr } from "ramda";

// store
import { CounterContext } from "../store/context";

// utils
import {
  connectDevice,
  capture,
  completeListener,
  socket,
  navigate,
  screeshot,
} from "../utils/device-control";

export const DeviceList = () => {
  const { state } = useContext(CounterContext);
  const device = pathOr({}, ["devices", 0], state);
  const [href, setHref] = useState("");

  useEffect(() => {
    if (device.present) {
      connectDevice(device);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  const capture = () =>
    screeshot(device.channel, (response) => {
      const { body } = JSON.parse(response);
      setHref(body.href);
    });

  return (
    <div>
      Device: {device.marketName}
      <div>
        <Button color="primary" onClick={capture}>
          GET
        </Button>
      </div>
      {href && <image src={href} alt={"no Image"} />}
    </div>
  );
};

storiesOf("Screenshot", module).add("First Devices", () => <DeviceList />);
