import React, { useContext } from "react";
import { storiesOf } from "@storybook/react";
import { pathOr } from "ramda";

import { CounterContext } from "../store/context";

export const DeviceList = ({ devices }) => (
  <div>
    Listing Device Market Name:
    {devices.map((device, i) => (
      <div key={i}>{device.marketName}</div>
    ))}
  </div>
);

storiesOf("Device Listing", module).add("Devices", () => {
  const { state } = useContext(CounterContext);
  const devices = pathOr([], ["devices"], state);

  return devices.length > 0 ? <DeviceList devices={devices} /> : <></>;
});
