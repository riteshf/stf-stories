import { mergeLeft, pathOr } from "ramda";

export const initialState = {
  intialized: false,
  devices: [],
  logs: [],
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
    case "FETCH_DEVICES": {
      return mergeLeft(
        {
          devices: action.payload,
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
