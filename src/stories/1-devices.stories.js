import React, { useState, useEffect } from "react";

export const App = () => {
  const [response, setResponse] = useState("");

  const getDevices = async () => {
    const { headers } = await fetch("http://localhost:7100/auth/mock/", {
      mode: "cors",
    });
    if (headers) {
      const { data } = await fetch("http://localhost:7100/api/v1/devices", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        "Content-Type": "application/json",
      });
      setResponse(data.devices);
    }
    headers.forEach(function (val, key) {
      console.log(key + " -> " + val);
    });
  };

  useEffect(() => {
    getDevices();
  }, []);

  return (
    <p>
      It's <time dateTime={response}>{response}</time>
    </p>
  );
};

App.story = {
  name: "Access Token ",
  decorators: [
    (storyFn) => <div styl={{ backgroundColor: "red" }}>{storyFn()}</div>,
  ],
};

export default {
  title: "devices",
  component: App,
};
