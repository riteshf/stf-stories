//  vendor
import React, { useContext } from "react";
import { storiesOf } from "@storybook/react";
import { pathOr } from "ramda";

// store
import { CounterContext } from "../store/context";

// components
import { DeviceScreen } from "../components/device-screen/device-screen";

export const DeviceList = () => {
  const { state } = useContext(CounterContext);
  const device = pathOr({}, ["devices", 0], state);

  return (
    <div>
      Device: {device.marketName}
      {device.serial && (
        <div>
          <DeviceScreen device={device} />
        </div>
      )}
    </div>
  );
};

storiesOf("Screen", module).add("First Devices", () => <DeviceList />);
