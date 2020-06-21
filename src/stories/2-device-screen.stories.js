//  vendor
import React, { useContext, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { pathOr } from "ramda";

// store
import { CounterContext } from "../store/context";

// components
import { DeviceScreen } from "../components/device-screen/device-screen";
import {
  completeListener,
  removeCompleteListener,
} from "../utils/device-control";

export const DeviceList = () => {
  const { state } = useContext(CounterContext);
  const device = pathOr({}, ["devices", 0], state);

  useEffect(() => {
    completeListener();
    return () => removeCompleteListener();
  }, []);

  return (
    <div>
      Device: {device.marketName}
      {device.present && (
        <div>
          <DeviceScreen device={device} />
        </div>
      )}
    </div>
  );
};

storiesOf("Screen", module).add("First Devices", () => <DeviceList />);
