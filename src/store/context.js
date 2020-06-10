import React, { useReducer, createContext } from "react";

import { authinticate, getDevices } from "./actions";
import { initialState, reducerFunction } from "./reducer";

const CounterContext = createContext(initialState);

function CounterProvider(props) {
  const initialize = async () => {
    const isAuthenticated = await authinticate();
    dispatch({ type: "INITIALIZE", payload: isAuthenticated });
    if (isAuthenticated) {
      const devices = await getDevices();
      dispatch({ type: "FETCH_DEVICES", payload: devices });
    }
  };

  const [state, dispatch] = useReducer(reducerFunction, initialState);

  initialize();
  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {props.children}
    </CounterContext.Provider>
  );
}

export { CounterContext, CounterProvider };
