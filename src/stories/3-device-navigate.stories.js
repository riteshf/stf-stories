//  vendor
import React, { useContext, useEffect, useState } from "react";
import { storiesOf } from "@storybook/react";
import {
  Button,
  InputGroup,
  Input,
  InputGroupAddon,
  InputGroupButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  FormGroup,
  Label,
  Col,
} from "reactstrap";
import { pathOr } from "ramda";

// store
import { CounterContext } from "../store/context";

// utils
import {
  connectDevice,
  navigate,
  completeListener,
  removeCompleteListener,
} from "../utils/device-control";

export const DeviceNavigate = () => {
  const {
    state: { devices },
  } = useContext(CounterContext);
  const [device, setDevice] = useState({});

  const selectDevice = (serial) => {
    const d = devices.filter((d) => d.serial === serial)[0];
    if (d && d.present) {
      setDevice(d);
    } else {
      setDevice({});
    }
  };

  const browsers = pathOr([], ["browser", "apps"], device);

  const [splitButtonOpen, setSplitButtonOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [browser, setBrowser] = useState(null);

  const toggleSplit = () => setSplitButtonOpen(!splitButtonOpen);

  const onGo = () => {
    navigate(device.channel, url, browser.id);
  };

  useEffect(() => {
    if (device.channel) {
      connectDevice(device);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  useEffect(() => {
    if (browsers.length > 0) {
      setBrowser(browsers[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browsers]);

  useEffect(() => {
    completeListener();
    return () => removeCompleteListener();
  }, []);
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
      {device.present && browser ? (
        <div>
          <InputGroup>
            <InputGroupButtonDropdown
              addonType="prepend"
              isOpen={splitButtonOpen}
              toggle={toggleSplit}
            >
              <Button outline>{browser.name}</Button>
              <DropdownToggle split outline />
              <DropdownMenu>
                {browsers.map(({ id, name }, i) => (
                  <DropdownItem
                    key={i}
                    value={id}
                    onClick={() => setBrowser({ id, name })}
                  >
                    {name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </InputGroupButtonDropdown>
            <Input
              placeholder="http://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <InputGroupAddon addonType="append">
              <Button color="primary" disabled={!url} onClick={onGo}>
                Go
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>
      ) : (
        "No Browser Present"
      )}
    </div>
  );
};

storiesOf("Navigate", module).add("First Devices", () => <DeviceNavigate />);
