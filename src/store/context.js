import React, { useReducer, createContext, useEffect } from "react";
import { mergeLeft, pathOr } from "ramda";

import { authinticate, getDevices } from "./actions";
const initialState = {
  intialized: false,
  devices: [],
  logs: [],
};

const reducerFunction = (state, action) => {
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

const CounterContext = createContext(initialState);

function CounterProvider(props) {
  const [state, dispatch] = useReducer(reducerFunction, initialState);

  const initialize = async () => {
    const isAuthenticated = await authinticate();
    dispatch({ type: "INITIALIZE", payload: isAuthenticated });
    if (isAuthenticated) {
      const devices = await getDevices();
      dispatch({ type: "FETCH_DEVICES", payload: devices });
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {props.children}
    </CounterContext.Provider>
  );
}

export { CounterContext, CounterProvider };
