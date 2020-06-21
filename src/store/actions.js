// import { getCookie } from "../utils";
import { socket } from "../utils/device-control";
import { getCookie } from "./utils";

import {serverUrl} from '../environment.json'

const initialize = async (dispatch) => {
  try {
    const { status } = await fetch(`${serverUrl}/auth/mock/`, {
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

const contact = async (dispatch) => {
  try {
    const mock = await initialize(dispatch);
    if (mock) {
      const { status } = await fetch(`${serverUrl}/auth/contact`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });
      dispatch({ type: "CONTACT", payload: status === 200 });
      return status === 200;
    }
  } catch (error) {
    return false;
  }
};

export const authenticate = async (dispatch) => {
  try {
    const communicate = await contact(dispatch);
    if (communicate) {
      const headers = new Headers({
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
        ssid: getCookie("ssid"),
        "ssid.sig": getCookie("ssid.sig"),
        "XSRF-TOKEN": getCookie("XSRF-TOKEN"),
        
      });
      const { status } = await fetch(`${serverUrl}/auth/api/v1/mock`, {
        method: "POST",
        mode: "cors",
        headers,
        body: JSON.stringify({"name":"xxx","email":"aa.bb@gmail.com"}),
      });
      dispatch({ type: "AUTHENTICATE", payload: status === 200 });
      return status === 200;
    }
  } catch (error) {
    return false;
  }
};

export const getDevices = async (dispatch) => {
  const isAunthenticated = await authenticate(dispatch);
  if (isAunthenticated) {
    try {
      const response = await fetch(`${serverUrl}/api/v1/devices`, {
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

export const enableAddLogs = (dispatch) => {
  socket.on("logcat.entry", (rawData) => {
    dispatch({ type: "ADD_LOG", payload: rawData.message });
  });
};