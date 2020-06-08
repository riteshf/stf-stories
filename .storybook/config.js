import React from "react";
import { configure, addDecorator } from "@storybook/react";

// css
import "bootstrap/dist/css/bootstrap.min.css";

// store
import { CounterProvider } from "../src/store/context";

const req = require.context("../src/stories", true, /.stories.js$/);

function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

addDecorator((story) => <CounterProvider>{story()}</CounterProvider>);

configure(loadStories, module);
