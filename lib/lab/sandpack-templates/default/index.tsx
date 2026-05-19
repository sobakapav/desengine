import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/* __EXTRA_IMPORTS__ */

import "./styles.css";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Preview root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

