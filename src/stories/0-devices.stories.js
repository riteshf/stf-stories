import React, { useContext, useEffect } from "react";
import { storiesOf } from "@storybook/react";

import { CounterContext } from "../store/context";
import { getDevices } from "../store/actions";

export const DeviceList = () => {
  const {
    state: { devices },
  } = useContext(CounterContext);

  return (
    <div>
      Listing Device Market Name:
      {devices.map((device, i) => (
        <div key={i}>{device.marketName}</div>
      ))}
    </div>
  );
};

storiesOf("Device Listing", module).add("All Devices", () => <DeviceList />);
