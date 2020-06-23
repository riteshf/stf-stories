//  vendor
import React, { useContext, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { pathOr } from "ramda";
import { ScreenShare } from "stf-screenshare";

// store
import { CounterContext } from "../store/context";

// components
import {
  completeListener,
  removeCompleteListener,
  socket,
} from "../utils/device-control";

export const DeviceScreenStory = () => {
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
          <ScreenShare device={device} appSocket={socket} />
        </div>
      )}
    </div>
  );
};

storiesOf("Screen", module).add("First Devices", () => <DeviceScreenStory />);
