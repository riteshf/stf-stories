//  vendor
import React, { useContext } from "react";
import { storiesOf } from "@storybook/react";
import { pathOr } from "ramda";

// store
import { CounterContext } from "../store/context";

// components
import { DeviceScreen } from "./device-screen";

export const DeviceList = () => {
  const { state } = useContext(CounterContext);
  const device = pathOr({}, ["devices", 0], state);

  return (
    <div>
      Device: {device.marketName}
      {device.serial && (
        <>
          <DeviceScreen device={device} />
        </>
      )}
    </div>
  );
};

storiesOf("Screen", module).add("First Devices", () => <DeviceList />);
