import React, { useReducer, createContext, useEffect } from "react";

import { authinticate } from "./actions";
const initialState = {
  intialized: false,
  devices: [],
};

const reducerFunction = (state, action) => {
  switch (action.type) {
    case "INITIALIZE": {
      return { ...state, intialized: action.payload };
    }
    case "FETCH_DEVICES": {
      return { ...state, devices: action.payload };
    }
    default:
      throw new Error();
  }
};

const CounterContext = createContext(initialState);

function CounterProvider(props) {
  const [state, dispatch] = useReducer(reducerFunction, initialState);
  useEffect(() => {
    authinticate().then((isAuthenticated) =>
      dispatch({ type: "INITIALIZE", payload: isAuthenticated })
    );
  }, []);

  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {props.children}
    </CounterContext.Provider>
  );
}

export { CounterContext, CounterProvider };
