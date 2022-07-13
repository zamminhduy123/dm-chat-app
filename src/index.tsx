import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.scss";
import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

const appElement = document.getElementById("app");

ReactDOM.render(<App />, appElement);
