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
  const isAunthenticated = await contact(dispatch);
  const csrfToken = getCookie("XSRF-TOKEN");
  if (isAunthenticated) {
    try {
      const { status } = await fetch("http://localhost:7100/auth/api/v1/mock", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          name: "riteshf",
          email: "firodiya.ritesh@gmail.com",
        }),
      });

      const success = status === 200 || status === 204;
      dispatch({ type: "AUTHENTICATE", payload: success });
      return success;
    } catch (error) {
      return false;
    }
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
