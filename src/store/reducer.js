import { mergeLeft, pathOr, mergeDeepLeft } from "ramda";

export const initialState = {
  intialized: false,
  contact: false,
  authenticate: false,
  devices: [],
  logs: [],
};

const deepExtend = function (destination, source) {
  for (var property in source) {
    if (typeof source[property] === "object" && source[property] !== null) {
      destination[property] = destination[property] || {};
      // eslint-disable-next-line no-caller
      deepExtend(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
};
export const reducerFunction = (state, action) => {
  switch (action.type) {
    case "INITIALIZE": {
      return mergeLeft(
        {
          intialized: action.payload,
        },
        state
      );
    }
    case "CONTACT": {
      return mergeLeft(
        {
          contact: action.payload,
        },
        state
      );
    }
    case "AUTHENTICATE": {
      return mergeLeft(
        {
          authenticate: action.payload,
        },
        state
      );
    }
    case "FETCH_DEVICES": {
      return mergeLeft(
        {
          devices: action.payload,
        },
        state
      );
    }
    case "ADD_DEVICE": {
      const deviceIndex = state.devices.findIndex(
        ({ serial }) => serial === action.payload.serial
      );
      const newDevices = state.devices.splice(deviceIndex, 1, action.payload);

      return mergeDeepLeft(
        {
          devices: newDevices,
        },
        state
      );
    }
    case "DEVICE_UPDATE": {
      const devices = state.devices.map((device) => {
        if (device.serial === action.payload.serial) {
          deepExtend(device, action.payload);
        }
        return device;
      });

      return mergeLeft(
        {
          devices: devices,
        },
        state
      );
    }
    case "REMOVE_DEVICE": {
      const devices = state.devices.map((device) => {
        if (device.serial === action.payload.serial) {
          return action.payload;
        } else {
          return device;
        }
      });

      return mergeLeft(
        {
          devices: devices,
        },
        state
      );
    }
    case "ADD_LOG": {
      const oldLogs = pathOr([], ["logs"], state);
      return mergeLeft(
        {
          logs: [...oldLogs, action.payload],
        },
        state
      );
    }
    case "CLEAR_LOGS": {
      return mergeLeft(
        {
          logs: [],
        },
        state
      );
    }
    default:
      throw new Error();
  }
};
