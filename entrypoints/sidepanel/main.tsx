import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";
import "~/assets/tailwind.css";
import React from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
