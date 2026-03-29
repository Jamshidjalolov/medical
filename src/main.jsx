import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <ToastContainer position="top-right" autoClose={2600} hideProgressBar={false} newestOnTop theme="light" />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
