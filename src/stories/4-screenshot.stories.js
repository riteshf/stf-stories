//  vendor
import React, { useContext, useEffect, useState } from "react";
import { storiesOf } from "@storybook/react";
import { Button } from "reactstrap";
import { pathOr } from "ramda";

// store
import { CounterContext } from "../store/context";

// utils
import { connectDevice, screeshot } from "../utils/device-control";

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
      const json = JSON.parse(response.body);
      setHref(json.href);
    });

  return (
    <div>
      Device: {device.marketName}
      <div style={{ paddingBottom: "20px" }}>
        <Button color="primary" onClick={capture}>
          GET
        </Button>
      </div>
      {href && (
        <img
          src={`http://localhost:7100${href}`}
          alt=""
          width="220px"
          height="300px"
        />
      )}
    </div>
  );
};

storiesOf("Screenshot", module).add("First Devices", () => <DeviceList />);
