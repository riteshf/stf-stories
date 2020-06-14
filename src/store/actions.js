import { getCookie } from "../utils";

export const contact = async (dispatch) => {
  try {
    const { status } = await fetch("http://localhost:7100/auth/contact", {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    dispatch({ type: "INITIALIZE", payload: status === 200 });
    return status === 200;
  } catch (error) {
    return false;
  }
};

export const authenticate = async (dispatch) => {
  try {
    const { status } = await fetch("http://localhost:7100/auth/mock/", {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    dispatch({ type: "INITIALIZE", payload: status === 200 });
    return status === 200;
  } catch (error) {
    return false;
  }
};

export const getDevices = async (dispatch) => {
  const isAunthenticated = await authenticate(dispatch);
  if (isAunthenticated) {
    try {
      const response = await fetch("http://localhost:7100/api/v1/devices", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        "Content-Type": "application/json",
      });
      const { devices } = await response.json();
      dispatch({ type: "FETCH_DEVICES", payload: devices });
      return devices;
    } catch (error) {
      return false;
    }
  }
};
