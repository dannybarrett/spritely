import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div onContextMenu={e => e.preventDefault()}>
      <App />
    </div>
  </React.StrictMode>
);
