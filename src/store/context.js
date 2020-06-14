import React, { useReducer, createContext, useEffect } from "react";

import { getDevices } from "./actions";
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

  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      <Container>{props.children}</Container>
    </CounterContext.Provider>
  );
}

export { CounterContext, CounterProvider };
