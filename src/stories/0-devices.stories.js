import React, { useContext, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { pathOr } from "ramda";

import { CounterContext } from "../store/context";
import {
  completeListener,
  removeCompleteListener,
} from "../utils/device-control";

export const DeviceList = () => {
  const { state } = useContext(CounterContext);
  const devices = pathOr([], ["devices"], state);

  useEffect(() => {
    completeListener();
    return () => removeCompleteListener();
  }, []);
  return (
    <div>
      Listing Device Market Name:
      {devices.map((device, i) => (
        <div key={i}>{device.marketName}</div>
      ))}
    </div>
  );
};

storiesOf("Device Listing", module).add("Devices", () => <DeviceList />);
