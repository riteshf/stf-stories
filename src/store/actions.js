// import { getCookie } from "../utils";
import { socket } from "../utils/device-control";

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
    dispatch({ type: "AUTHENTICATE", payload: status === 200 });
    return status === 200;
  } catch (error) {
    return false;
  }
};

export const addDeviceListeners = (dispatch) => {
  socket
    .on("device.add", (rawData) => {
      dispatch({ type: "ADD_DEVICE", payload: rawData.data });
    })
    .on("device.change", (rawData) => {
      dispatch({ type: "DEVICE_UPDATE", payload: rawData.data });
    })
    .on("device.remove", (rawData) => {
      dispatch({ type: "REMOVE_DEVICE", payload: rawData.data });
    });
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
