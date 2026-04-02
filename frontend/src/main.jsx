import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom"; // ✅ ADD THIS

console.log("API URL:", import.meta.env.VITE_API_URL);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>   {/* ✅ WRAP HERE */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);