import React, { useReducer, createContext, useEffect } from "react";

import { getDevices, addDeviceListeners } from "./actions";
import { initialState, reducerFunction } from "./reducer";
import { Container } from "reactstrap";

const CounterContext = createContext(initialState);

function CounterProvider(props) {
  const [state, dispatch] = useReducer(reducerFunction, initialState);

  const initialize = async () => {
    await getDevices(dispatch);
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (state.authenticate) {
      addDeviceListeners(dispatch);
    }
  }, [state]);

  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      <Container>{props.children}</Container>
    </CounterContext.Provider>
  );
}

export { CounterContext, CounterProvider };
