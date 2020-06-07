import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import url from 'url'

// constants
import * as ENV from '../environment.json';

export const App = () => {
  const [response, setResponse] = useState("");

  var wsUrl = url.parse('http://localhost:7110', true)
    wsUrl.query.uip = window.location.hostname
  const websocketUrl = url.format(wsUrl)

   
  useEffect(() => {
    const socket = socketIOClient(websocketUrl, {
      reconnection: false, transports: ['websocket']
    });
    socket.emit('user.keys.accessToken.generate', {
      title: 'temp'
    })
  }, []);

  return (
    <p>
      It's <time dateTime={response}>{response}</time>
    </p>
  );
}

App.story = {
  name: 'Access Token ',
  decorators: [storyFn => (
    <div styl={{backgroundColor: 'red'}}>
      {storyFn()}
    </div>)]
};

export default {
  title: 'Initial',
  component: App,
};
