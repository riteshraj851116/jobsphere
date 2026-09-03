import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import "./index.css";
import "./styles/global.css";

// Dynamically determine basename: only use "/jobsphere" when hosted on GitHub Pages
const getBasename = () => {
  if (typeof window !== "undefined" && window.location.hostname.includes("github.io")) {
    return "/jobsphere";
  }
  return "";
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);