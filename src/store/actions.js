export const authinticate = async () => {
  try {
    const { status } = await fetch("http://localhost:7100/auth/mock/", {
      mode: "cors",
    });
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
