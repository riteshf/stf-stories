import socketIOClient from "socket.io-client";
import url from "url";

export const authinticate = async () => {
  try {
    const { status } = await fetch("http://localhost:7100/auth/mock/", {
      mode: "cors",
    });
    if (status === 200) {
      const wsUrl = url.parse("http://localhost:7110", true);
      wsUrl.query.uip = window.location.hostname;
      const websocketUrl = url.format(wsUrl);
      const socket = socketIOClient(websocketUrl, {
        reconnection: false,
        transports: ["websocket"],
      });
      socket.emit("user.keys.accessToken.generate", {
        title: "temp",
      });
    }
    return status === 200;
  } catch (error) {
    return false;
  }
};
export const getDevices = async () => {
  const isAunthenticated = await authinticate();
  if (!isAunthenticated) return [];
  const response = await fetch("http://localhost:7100/api/v1/devices", {
    method: "GET",
    mode: "cors",
    credentials: "include",
    "Content-Type": "application/json",
  });
  const { devices } = await response.json();
  return devices;
};
