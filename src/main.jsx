import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Home from "./Home";

import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";

import { ChatProvider } from "./hooks/useChat";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/Chat",
    element: (
      <ChatProvider>
        <App />
      </ChatProvider>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
